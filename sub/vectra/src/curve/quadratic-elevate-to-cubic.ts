import type { XYInput, XYObjectWritable } from '../types';
import { quadraticElevateToCubicInto } from './quadratic-elevate-to-cubic-into';

/**
 * quadratic Bezier curve를 동등한 cubic Bezier curve로 정확하게 변환하여 새 object로 반환한다.
 *
 * `quadraticElevateToCubicInto`의 allocating companion. 결과는 plain object `{ p0, p1, p2, p3 }`다.
 *
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 */
export function quadraticElevateToCubic(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput
): { p0: XYObjectWritable; p1: XYObjectWritable; p2: XYObjectWritable; p3: XYObjectWritable } {
  const out = {
    p0: { x: 0, y: 0 },
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0 },
    p3: { x: 0, y: 0 },
  };
  return quadraticElevateToCubicInto(out, p0, p1, p2);
}
