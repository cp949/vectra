import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import type {
  ArcCommand,
  CenterArcWritable,
  CloseCommand,
  CubicCommand,
  LineCommand,
  PathCommand,
  QuadraticCommand,
  XYObjectWritable,
} from '../types/index';

/**
 * path traversal 중 각 drawing segment를 나타내는 internal data.
 * discriminated union으로 정의하여 kind 분기 안에서 command가 자동 narrowing된다.
 */
export type DrawSegment =
  | {
      kind: 'line';
      fromX: number;
      fromY: number;
      startsSubpath: boolean;
      command: LineCommand;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'quadratic';
      fromX: number;
      fromY: number;
      startsSubpath: boolean;
      command: QuadraticCommand;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'cubic';
      fromX: number;
      fromY: number;
      startsSubpath: boolean;
      command: CubicCommand;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'arc';
      fromX: number;
      fromY: number;
      startsSubpath: boolean;
      command: ArcCommand;
      subpathStartX: number;
      subpathStartY: number;
    }
  | {
      kind: 'close';
      fromX: number;
      fromY: number;
      command: CloseCommand;
      subpathStartX: number;
      subpathStartY: number;
    };

/**
 * commands를 순회하며 drawing segment마다 visitor를 호출한다.
 *
 * - empty path → visitor 호출 없이 반환
 * - 첫 command가 MoveCommand 아님 → 암묵적 origin (0,0)을 subpath start로 사용
 * - consecutive MoveCommand → 마지막 MoveCommand가 subpath start; 이전 것은 visitor 미호출
 * - CloseCommand → current→subpath start line segment로 visitor 호출
 *   단, 직전이 MoveCommand이면 zero-length no-op이므로 visitor 호출 안 함
 * - CloseCommand 직후 draw → subpath start가 current point로 재사용
 */
export function forEachDrawSegment(commands: readonly PathCommand[], visitor: (seg: DrawSegment) => void): void {
  // 현재 current point
  let curX = 0;
  let curY = 0;
  // 현재 subpath start
  let subX = 0;
  let subY = 0;
  // 직전에 drawing segment가 발생했는지 (= subpath가 열렸는지)
  let subpathOpen = false;
  // 직전 command가 MoveCommand였는지
  let prevWasMove = false;

  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      curX = cmd.x;
      curY = cmd.y;
      subX = cmd.x;
      subY = cmd.y;
      subpathOpen = false;
      prevWasMove = true;
      continue;
    }

    if (cmd.kind === 'close') {
      // prevWasMove: Move→Close는 zero-length이므로 no-op
      // subpathOpen: drawing segment 없이 Close가 오면 닫을 subpath가 없으므로 no-op
      if (!prevWasMove && subpathOpen) {
        visitor({
          kind: 'close',
          fromX: curX,
          fromY: curY,
          command: cmd,
          subpathStartX: subX,
          subpathStartY: subY,
        });
      }
      // close 후 current = subpath start
      curX = subX;
      curY = subY;
      subpathOpen = false;
      prevWasMove = false;
      continue;
    }

    // line / quadratic / cubic / arc — drawing segment
    const fromX = curX;
    const fromY = curY;
    const startsSubpath = !subpathOpen;

    // subpath가 아직 열리지 않았으면 첫 drawing segment → subpath start가 current
    if (startsSubpath) {
      subX = fromX;
      subY = fromY;
      subpathOpen = true;
    }

    // discriminated union 각 branch별로 visitor 호출해야 TypeScript가 command 타입을 좁힌다
    if (cmd.kind === 'line') {
      visitor({ kind: 'line', fromX, fromY, startsSubpath, command: cmd, subpathStartX: subX, subpathStartY: subY });
    } else if (cmd.kind === 'quadratic') {
      visitor({
        kind: 'quadratic',
        fromX,
        fromY,
        startsSubpath,
        command: cmd,
        subpathStartX: subX,
        subpathStartY: subY,
      });
    } else if (cmd.kind === 'cubic') {
      visitor({ kind: 'cubic', fromX, fromY, startsSubpath, command: cmd, subpathStartX: subX, subpathStartY: subY });
    } else if (cmd.kind === 'arc') {
      visitor({ kind: 'arc', fromX, fromY, startsSubpath, command: cmd, subpathStartX: subX, subpathStartY: subY });
    }

    // current point 갱신 — MoveCommand·CloseCommand는 위에서 continue로 걸러지므로
    // 여기서 cmd는 LineCommand | QuadraticCommand | CubicCommand | ArcCommand이며
    // 모두 x, y 필드를 가진다
    curX = cmd.x;
    curY = cmd.y;

    prevWasMove = false;
  }
}

/**
 * 재사용 가능한 `CenterArcWritable` 버퍼를 새로 생성한다.
 *
 * 모든 필드는 0 또는 false로 초기화된다. arc segment 처리 시 `endpointArcToCenterInto`가
 * 필드를 덮어쓴다.
 */
export function createCenterArcBuf(): CenterArcWritable {
  return {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  };
}

/**
 * drawing segment를 flatten polyline으로 segBuf에 기록한다.
 *
 * - line / close: 시작점과 끝점 2개 push (각각 `seg.fromX/Y`와 endpoint 또는 subpath start)
 * - quadratic / cubic / arc: 대응 flatten 함수가 segBuf를 클리어 후 시작점부터 끝점까지 push
 *
 * `centerArcBuf`는 arc segment에서만 endpoint→center 변환 결과로 덮어써진다. 호출자가 함수
 * 단위 재사용을 위해 공유 버퍼를 전달한다.
 *
 * @param segBuf flatten polyline을 기록할 배열 (기존 내용은 덮어쓰인다)
 * @param seg 처리할 drawing segment
 * @param flatOpts flatten flatness / maxRecursion 옵션
 * @param centerArcBuf arc endpoint→center 변환 재사용 버퍼
 */
export function flattenDrawSegmentInto(
  segBuf: XYObjectWritable[],
  seg: DrawSegment,
  flatOpts: { flatness: number; maxRecursion: number },
  centerArcBuf: CenterArcWritable
): void {
  if (seg.kind === 'line') {
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.command.x, y: seg.command.y });
  } else if (seg.kind === 'close') {
    segBuf.length = 0;
    segBuf.push({ x: seg.fromX, y: seg.fromY });
    segBuf.push({ x: seg.subpathStartX, y: seg.subpathStartY });
  } else if (seg.kind === 'quadratic') {
    const cmd = seg.command;
    quadraticFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'cubic') {
    const cmd = seg.command;
    cubicFlattenInto(
      segBuf,
      { x: seg.fromX, y: seg.fromY },
      { x: cmd.x1, y: cmd.y1 },
      { x: cmd.x2, y: cmd.y2 },
      { x: cmd.x, y: cmd.y },
      flatOpts
    );
  } else if (seg.kind === 'arc') {
    endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
    arcFlattenInto(segBuf, centerArcBuf, flatOpts);
  }
}
