import type { XYInput } from '../types';
import { assertFiniteT, cubicBezierRaw } from './easing.internal';

/** XYInput에서 x 좌표를 읽는다. */
function readX(input: XYInput): number {
  return Array.isArray(input) ? input[0] : (input as { x: number }).x;
}

/** XYInput에서 y 좌표를 읽는다. */
function readY(input: XYInput): number {
  return Array.isArray(input) ? input[1] : (input as { y: number }).y;
}

/**
 * CSS cubic-bezier(x1, y1, x2, y2) mental model의 scalar easing 함수다.
 *
 * 제어점 P0=(0,0), P1=(x1,y1), P2=(x2,y2), P3=(1,1).
 * x curve에서 t에 대응하는 parameter를 Newton iteration + bisection fallback으로 구하고
 * 그 parameter로 y curve 값을 반환한다.
 * t === 0 → 정확히 0, t === 1 → 정확히 1.
 * control1.x, control2.x는 finite이고 [0, 1] 범위여야 한다. 위반 시 RangeError.
 * control1.y, control2.y는 finite여야 한다. y overshoot/undershoot는 허용된다.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param control1 첫 번째 제어점 (x1, y1)
 * @param control2 두 번째 제어점 (x2, y2)
 */
export function cubicBezier(t: number, control1: XYInput, control2: XYInput): number {
  assertFiniteT(t);

  const x1 = readX(control1);
  const y1 = readY(control1);
  const x2 = readX(control2);
  const y2 = readY(control2);

  if (!Number.isFinite(x1) || x1 < 0 || x1 > 1) {
    throw new RangeError('cubicBezier control1.x must be a finite number in [0, 1]');
  }
  if (!Number.isFinite(y1)) {
    throw new RangeError('cubicBezier control1.y must be a finite number');
  }
  if (!Number.isFinite(x2) || x2 < 0 || x2 > 1) {
    throw new RangeError('cubicBezier control2.x must be a finite number in [0, 1]');
  }
  if (!Number.isFinite(y2)) {
    throw new RangeError('cubicBezier control2.y must be a finite number');
  }

  return cubicBezierRaw(t, x1, y1, x2, y2);
}
