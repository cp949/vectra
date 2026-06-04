import type { XYInput, XYObjectWritable } from '../types';
import { cubicPointAtTInto } from './cubic-point-at-t-into';

/**
 * cubic Bezier curve 위의 파라미터 t 위치 point를 새 object로 반환한다.
 *
 * `cubicPointAtTInto`의 allocating companion. 결과는 새 plain `{ x, y }`이다.
 *
 * 수식: B(t) = (1-t)³·p0 + 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³·p3
 * t는 clamp 없이 수식 그대로 계산한다. `t < 0` 또는 `t > 1`이면 외삽(extrapolation) 결과를 반환한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 * @returns 새 plain `{ x, y }` object
 */
export function cubicPointAtT(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput, t: number): XYObjectWritable {
  return cubicPointAtTInto({ x: 0, y: 0 }, p0, p1, p2, p3, t);
}
