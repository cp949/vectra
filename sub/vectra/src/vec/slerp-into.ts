import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * 두 unit vector a, b 사이를 구면 보간(slerp)한 결과를 out에 기록하고 out을 반환한다.
 *
 * t = 0이면 a, t = 1이면 b 방향의 unit vector를 반환한다.
 * t는 0~1 범위를 권장하지만 강제하지 않는다.
 *
 * 전제 조건: a와 b는 unit vector여야 한다 (caller 책임).
 * a 또는 b가 zero-vector이면 RangeError를 던진다.
 *
 * a와 b가 거의 같은 방향(`|omega| < 1e-10`)이거나 정반대(`|omega - π| < 1e-10`)인 경우 선형 보간(lerp)으로 fallback한다.
 * 정반대 방향에서는 2D 보간 평면이 유일하지 않으므로 결과 길이가 보장되지 않는다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 시작 unit vector (t = 0)
 * @param b 끝 unit vector (t = 1)
 * @param t 보간 계수
 */
export function slerpInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, t: number): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);

  const aLenSq = ax * ax + ay * ay;
  const bLenSq = bx * bx + by * by;
  if (aLenSq === 0 || bLenSq === 0) {
    throw new RangeError('slerp: zero-vector는 방향이 없으므로 보간할 수 없다');
  }

  const dot = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by));
  // 수치 오차로 [-1, 1] 범위를 벗어나는 경우를 clamp한다
  const clampedDot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(clampedDot);

  // 거의 같은 방향이거나 정반대인 경우 lerp fallback — sinOmega ≈ 0 이므로 나눗셈 불안정
  if (Math.abs(omega) < 1e-10 || Math.abs(omega - Math.PI) < 1e-10) {
    return writeXY(out, ax + (bx - ax) * t, ay + (by - ay) * t);
  }

  const sinOmega = Math.sin(omega);
  const sa = Math.sin((1 - t) * omega) / sinOmega;
  const sb = Math.sin(t * omega) / sinOmega;
  return writeXY(out, ax * sa + bx * sb, ay * sa + by * sb);
}
