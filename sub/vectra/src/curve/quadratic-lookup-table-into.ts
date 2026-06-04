import type { CurveLookupEntry, XYInput } from '../types';
import { quadraticPointAtTInto } from './quadratic-point-at-t-into';

/**
 * quadratic Bezier curve를 uniform t로 sampling한 cumulative chord-length lookup table을 out에 push하고 out을 반환한다.
 *
 * sample 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * entry는 { t, length } fixed object이며, length는 인접 sample 사이 Euclidean chord distance의 누적값이다.
 * exact arc length가 아니라 빠른 approximate lookup용 chord-length table이다.
 * 첫 entry는 { t: 0, length: 0 }, 마지막 entry는 { t: 1, length: approximateTotalLength }.
 * length는 nondecreasing이다. zero-length curve는 모든 length가 0이다.
 * 각 entry는 새 plain object다. 좌표는 검증 없이 사용하므로 NaN/Infinity는 length로 pass-through된다.
 * steps validation 실패 시 RangeError를 던지고 out은 그대로 유지된다(temp commit).
 *
 * @param out entry를 push할 배열. 성공 시 기존 내용은 clear된다.
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param steps table entry 수. 2 이상 0xffffffff 이하의 safe integer. 범위 밖이면 RangeError.
 * @returns out
 */
export function quadraticLookupTableInto(
  out: CurveLookupEntry[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  steps: number
): CurveLookupEntry[] {
  if (!Number.isSafeInteger(steps) || steps < 2 || steps > 0xffffffff) {
    throw new RangeError(`steps must be a safe integer in [2, 4294967295], got ${steps}`);
  }

  const last = steps - 1;
  const temp: CurveLookupEntry[] = [];
  const scratch = { x: 0, y: 0 };
  let prevX = 0;
  let prevY = 0;
  let acc = 0;

  for (let i = 0; i < steps; i++) {
    const t = i / last;
    quadraticPointAtTInto(scratch, p0, p1, p2, t);
    const x = scratch.x;
    const y = scratch.y;
    if (i > 0) {
      acc += Math.hypot(x - prevX, y - prevY);
    }
    temp.push({ t, length: acc });
    prevX = x;
    prevY = y;
  }

  out.length = 0;
  for (const entry of temp) out.push(entry);
  return out;
}
