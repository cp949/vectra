import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, QuadraticCurve } from '../types/flat-shapes.internal';
import { quadraticBoundsInto } from './quadratic-bounds-into';

/**
 * quadratic Bezier curve의 axis-aligned bounding box를 새 object로 반환한다.
 *
 * `quadraticBoundsInto`의 allocating companion. 결과는 새 plain `{ minX, minY, maxX, maxY }`이다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여 min/max를 계산한다.
 *
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @returns 새 plain bounds object
 */
export function quadraticBounds(curve: QuadraticCurve): BoundsWritable {
  return quadraticBoundsInto(createZeroBounds(), curve);
}
