import { createBounds } from '../bounds/create-bounds';
import type { BoundsWritable, RotatedEllipseLike } from '../types';
import { rotatedBoundsInto } from './rotated-bounds-into';

/**
 * rotated ellipse를 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * oriented bounds가 아니라 AABB다. 전체 ellipse의 closed-form half-extent(φ = rotation):
 *   Δx = sqrt(radiusX²·cos²φ + radiusY²·sin²φ)
 *   Δy = sqrt(radiusX²·sin²φ + radiusY²·cos²φ)
 *   min = (cx - Δx, cy - Δy), max = (cx + Δx, cy + Δy)
 * half-extent는 `Math.hypot`으로 계산해 finite 큰 radius overflow와 subnormal underflow를 줄인다.
 * radiusX <= 0 또는 radiusY <= 0인 empty ellipse는 sentinel empty bounds
 * (min = (+Inf, +Inf), max = (-Inf, -Inf))를 반환한다.
 *
 * @param ellipse bounds로 변환할 rotated ellipse
 */
export function rotatedBounds(ellipse: RotatedEllipseLike): BoundsWritable {
  return rotatedBoundsInto(createBounds(), ellipse);
}
