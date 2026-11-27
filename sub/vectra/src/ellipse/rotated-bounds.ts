import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, RotatedEllipse } from '../types/flat-shapes.internal';
import { rotatedBoundsInto } from './rotated-bounds-into';

/**
 * rotated ellipse를 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * oriented bounds가 아니라 AABB다. 전체 ellipse의 closed-form half-extent(φ = rotation):
 *   Δx = sqrt(rx²·cos²φ + ry²·sin²φ)
 *   Δy = sqrt(rx²·sin²φ + ry²·cos²φ)
 *   (minX, minY) = (cx - Δx, cy - Δy), (maxX, maxY) = (cx + Δx, cy + Δy)
 * half-extent는 overflow·underflow를 피하는 Euclidean 길이로 계산해 finite 큰 radius overflow와 subnormal underflow를 줄인다.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 sentinel empty bounds
 * (minX = minY = +Inf, maxX = maxY = -Inf)를 반환한다.
 *
 * @param ellipse bounds로 변환할 rotated ellipse
 */
export function rotatedBounds(ellipse: RotatedEllipse): BoundsWritable {
  return rotatedBoundsInto(createZeroBounds(), ellipse);
}
