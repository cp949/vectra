import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';

/** path의 draw segment 수를 센다. MoveCommand·no-op CloseCommand는 제외된다. */
function countDrawSegments(commands: readonly PathCommand[]): number {
  let n = 0;
  forEachDrawSegment(commands, () => {
    n += 1;
  });
  return n;
}

/**
 * commands를 복사하면서 draw segment 사이에 zero-length cubic을 분산 삽입한다.
 *
 * 삽입 위치 정책: 기존 draw segment 경계에 비례 분산한다 (svg-path-commander의
 * segment 균등화 방식 참고). draw segment가 d개이고 extra가 e개일 때 각 draw
 * 직후에 `round((i + 1) * e / d) - round(i * e / d)`개를 삽입한다. draw가 없으면
 * (empty / Move-only) path 시작점에 전부 삽입한다.
 *
 * 삽입 cubic은 control point와 endpoint가 모두 직전 current point에 모인 zero-length
 * 형태이므로 path shape를 바꾸지 않는다 (morph 전처리용 placeholder segment).
 *
 * zero-length line이 아니라 cubic으로 채우는 이유: 실제 cubic과 degenerate cubic
 * 사이 morph/interpolation이 cubic space 안에 머물러 morph 시점 command-kind
 * 보정이 불필요하기 때문이다.
 */
function copyWithPadding<Out extends PathCommand[]>(out: Out, commands: readonly PathCommand[], extra: number): void {
  out.length = 0;

  // 시작점 추적: 첫 command가 Move가 아니면 암묵적 origin (normalize 정책과 일치)
  let curX = 0;
  let curY = 0;

  const drawTotal = countDrawSegments(commands);

  // draw가 없으면 (empty / Move-only) 시작점에 zero-length cubic을 전부 삽입한다.
  if (drawTotal === 0) {
    for (const cmd of commands) {
      out.push(cmd as Out[number]);
      if (cmd.kind === 'move') {
        curX = cmd.x;
        curY = cmd.y;
      }
    }
    for (let i = 0; i < extra; i++) {
      out.push({ kind: 'cubic', x1: curX, y1: curY, x2: curX, y2: curY, x: curX, y: curY } as Out[number]);
    }
    return;
  }

  // i번째 draw segment까지 누적 삽입 수. round 기반 비례 분산.
  const insertedUpTo = (i: number): number => Math.round((i * extra) / drawTotal);

  // draw segment index (forEachDrawSegment 축과 동일하게 Move/no-op Close 제외)
  let drawIndex = 0;
  let prevWasMove = false;
  let subpathOpen = false;
  let subX = 0;
  let subY = 0;

  const pushPaddingAt = (x: number, y: number, count: number): void => {
    for (let k = 0; k < count; k++) {
      out.push({ kind: 'cubic', x1: x, y1: y, x2: x, y2: y, x, y } as Out[number]);
    }
  };

  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      out.push(cmd as Out[number]);
      curX = cmd.x;
      curY = cmd.y;
      subX = cmd.x;
      subY = cmd.y;
      subpathOpen = false;
      prevWasMove = true;
      continue;
    }

    if (cmd.kind === 'close') {
      const noOp = prevWasMove || !subpathOpen;
      out.push(cmd as Out[number]);
      if (!noOp) {
        // Close도 draw segment 1개. 경계에서 비례 분산 삽입.
        const before = insertedUpTo(drawIndex);
        drawIndex += 1;
        const after = insertedUpTo(drawIndex);
        // close 후 current = subpath start
        curX = subX;
        curY = subY;
        pushPaddingAt(curX, curY, after - before);
      } else {
        curX = subX;
        curY = subY;
      }
      subpathOpen = false;
      prevWasMove = false;
      continue;
    }

    // line / quadratic / cubic / arc — draw segment
    if (!subpathOpen) {
      subX = curX;
      subY = curY;
      subpathOpen = true;
    }
    out.push(cmd as Out[number]);
    curX = cmd.x;
    curY = cmd.y;
    const before = insertedUpTo(drawIndex);
    drawIndex += 1;
    const after = insertedUpTo(drawIndex);
    pushPaddingAt(curX, curY, after - before);
    prevWasMove = false;
  }
}

/**
 * 두 path의 draw segment 수를 맞춰 out1, out2에 각각 기록한다 (morph 전처리).
 *
 * 짧은 쪽에 zero-length cubic을 삽입해 긴 쪽의 draw segment 수에 맞춘다. 삽입
 * 위치는 기존 draw segment 경계에 비례 분산한다 (정책은 contract D-04가 구현에
 * 위임. svg-path-commander 균등화 방식 참고). 삽입 cubic은 control point와
 * endpoint가 한 점에 모인 zero-length 형태라 path shape를 바꾸지 않는다.
 *
 * - out1, out2를 각각 clear(length = 0) 후 push 방식으로 채운다.
 * - draw segment 수가 같으면 양쪽 모두 입력 command를 그대로 재사용한다 (shallow copy 없음). 짧은 쪽에 삽입되는 zero-length cubic은 새 object다.
 * - 한쪽이 empty / Move-only면 그 path 시작점(또는 origin)에 zero-length cubic을
 *   다른 쪽 draw 수만큼 삽입한다.
 * - 양쪽 모두 empty면 out1, out2를 clear만 한다.
 * - multi-output 함수이므로 반환값이 없다 (`void`). generic `Out`을 반환하지 않는다.
 *
 * @param out1 commands1 균등화 결과를 기록할 mutable PathCommand 배열
 * @param out2 commands2 균등화 결과를 기록할 mutable PathCommand 배열
 * @param commands1 첫 번째 path command sequence (absolute 전제)
 * @param commands2 두 번째 path command sequence (absolute 전제)
 * @param _options 예약된 measurement 옵션. 현재 동작에 영향을 주지 않는다.
 */
export function equalizeSegmentsInto<Out1 extends PathCommand[], Out2 extends PathCommand[]>(
  out1: Out1,
  out2: Out2,
  commands1: readonly PathCommand[],
  commands2: readonly PathCommand[],
  _options?: PathMeasurementOptions
): void {
  // clear 전에 snapshot해 aliasing(out === commands)을 안전하게 처리
  const snap1 = commands1 === (out1 as readonly PathCommand[]) ? Array.from(commands1) : commands1;
  const snap2 = commands2 === (out2 as readonly PathCommand[]) ? Array.from(commands2) : commands2;

  const n1 = countDrawSegments(snap1);
  const n2 = countDrawSegments(snap2);
  const target = Math.max(n1, n2);

  copyWithPadding(out1, snap1, target - n1);
  copyWithPadding(out2, snap2, target - n2);
}
