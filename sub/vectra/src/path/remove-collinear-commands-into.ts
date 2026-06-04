import type { PathCommand } from '../types/index';

/** collinear 판정 옵션. */
export interface RemoveCollinearOptions {
  /** collinear 판정 각도 허용 오차 (radian). 기본값 1e-10. */
  angleTolerance?: number;
}

/**
 * 연속한 LineCommand 사이의 collinear 중간점을 제거한 path를 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다.
 * 세 점 A→B→C에서 B(LineCommand)의 turn angle이 angleTolerance 이내이면 B를 제거한다.
 * zero-length LineCommand(시작점 == 끝점)는 turn angle이 0이 되어 collinear로 간주되며,
 * 별도 분기 없이 함께 제거된다.
 *
 * - 제거 대상은 LineCommand만이다. Quadratic/Cubic/Arc waypoint와 CloseCommand는 그대로 통과한다.
 * - MoveCommand는 subpath 경계이므로 경계를 넘는 collinear 판단을 하지 않는다.
 * - Absolute-only 정책 전제. relative command 처리는 caller / SVG adapter 담당이다.
 * - empty commands → out을 clear만 하고 반환한다.
 * - invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 * - out과 commands가 같은 배열이어도 안전하다 (aliasing 허용).
 * - 입력 LineCommand object는 그대로 재사용한다 (제거되지 않는 command는 reference 그대로 push).
 *
 * @param out collinear 제거 결과를 기록할 mutable PathCommand 배열
 * @param commands 정리할 입력 command sequence (absolute, normalize 후 전달 가정)
 * @param options angleTolerance(radian, 기본 1e-10)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function removeCollinearCommandsInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  options?: RemoveCollinearOptions
): Out {
  // aliasing 대비: out === commands일 때 clear 전에 snapshot
  const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;

  out.length = 0;

  if (snapshot.length === 0) {
    return out;
  }

  const tol = options?.angleTolerance ?? 1e-10;

  // 직전 push된 command의 endpoint (current point)
  let lastX = 0;
  let lastY = 0;
  // 직전 push된 command가 LineCommand일 때, 그 Line 직전 point (= 후보 triple의 A)
  let beforeX = 0;
  let beforeY = 0;
  // 직전 push된 command가 collinear 제거 대상 LineCommand인지
  let lastIsLine = false;

  for (const cmd of snapshot) {
    if (cmd.kind === 'line') {
      if (lastIsLine) {
        // A(before) → B(last line endpoint) → C(this line endpoint)
        const ux = lastX - beforeX;
        const uy = lastY - beforeY;
        const vx = cmd.x - lastX;
        const vy = cmd.y - lastY;
        // zero-length vector는 atan2(0,0)=0 → collinear로 자연 처리
        const cross = ux * vy - uy * vx;
        const dot = ux * vx + uy * vy;
        const turn = Math.abs(Math.atan2(cross, dot));
        if (turn <= tol) {
          // 중간점 B 제거: 마지막으로 push된 Line을 이 Line으로 대체. A는 그대로 유지
          out[out.length - 1] = cmd;
          lastX = cmd.x;
          lastY = cmd.y;
          continue;
        }
      }
      // B를 보존: 이번 Line이 새 last가 되고, 직전 last가 A가 된다
      beforeX = lastX;
      beforeY = lastY;
      out.push(cmd as PathCommand as Out[number]);
      lastX = cmd.x;
      lastY = cmd.y;
      lastIsLine = true;
      continue;
    }

    // line 외 command는 collinear 대상 아님 — 그대로 통과
    out.push(cmd as Out[number]);
    lastIsLine = false;

    // close는 좌표 field가 없다. close 직후 LineCommand는 lastIsLine=false라
    // triple 대상이 아니므로 current point를 갱신하지 않아도 결과에 영향이 없다.
    // move / quadratic / cubic / arc는 모두 endpoint (x, y)를 가진다.
    if (cmd.kind !== 'close') {
      lastX = cmd.x;
      lastY = cmd.y;
    }
  }

  return out;
}
