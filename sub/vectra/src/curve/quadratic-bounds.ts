import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, XYInput } from '../types';
import { quadraticBoundsInto } from './quadratic-bounds-into';

/**
 * quadratic Bezier curve의 axis-aligned bounding box를 새 object로 반환한다.
 *
 * `quadraticBoundsInto`의 allocating companion. 결과는 새 plain `{ min: {x, y}, max: {x, y} }`이다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여 min/max를 계산한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @returns 새 plain bounds object
 */
export function quadraticBounds(p0: XYInput, p1: XYInput, p2: XYInput): BoundsWritable {
  return quadraticBoundsInto(createBounds(), p0, p1, p2);
}
