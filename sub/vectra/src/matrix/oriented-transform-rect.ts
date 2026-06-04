import type { MatrixLike, OrientedBoundsWritable, RectLike } from '../types';
import { orientedTransformRectInto } from './oriented-transform-rect-into';

/**
 * rect의 네 corner를 matrix로 변환한 oriented outline을 새 plain object로 반환한다.
 *
 * AABB로 감싸지 않고 변환된 네 corner 좌표를 그대로 기록한다. corner 순서는 `rect.cornersInto`와 같다:
 * `topLeft`(x, y) → `topRight`(x+width, y) → `bottomRight`(x+width, y+height) → `bottomLeft`(x, y+height).
 * `orientedTransformRectInto`의 allocating companion이다.
 *
 * empty/degenerate rect도 특별 처리 없이 네 corner를 변환한다. non-finite matrix/rect component는
 * 검증하지 않고 산술 결과를 그대로 기록한다 (caller 책임).
 *
 * @param matrix rect corner에 적용할 matrix
 * @param rect 변환할 rect
 */
export function orientedTransformRect(matrix: MatrixLike, rect: RectLike): OrientedBoundsWritable {
  return orientedTransformRectInto(
    {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    },
    matrix,
    rect
  );
}
