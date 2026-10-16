import type {
  ArcCommand,
  CloseCommand,
  CubicCommand,
  LineCommand,
  PathCommand,
  QuadraticCommand,
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
