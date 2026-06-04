import { readCircleCenter, readCircleRadius } from '../internal/circle';
import type { CircleLike, XYInput } from '../types';
import { canonicalizeZero, requireFiniteX, requireFiniteY, requireNonNegative } from './primitive.internal';

/**
 * annulus(ring)와 point 사이의 signed distance를 반환한다.
 *
 * `circle.radius`를 outer radius로 쓰고 `innerRadius`를 hole radius로 쓴다. ring interior는 nearest
 * boundary까지의 음수 거리, inner/outer boundary는 0, hole 내부와 ring 밖은 양수 거리다.
 *
 * `innerRadius === 0`은 hole이 없으므로 같은 outer radius circle과 같은 filled disk signed distance다.
 * `innerRadius === outerRadius`는 ring 두께가 0이므로 interior 음수 없이 circle boundary까지의 unsigned
 * 거리(`abs(distance - radius)`)를 반환한다.
 *
 * 모든 좌표와 radius는 finite여야 한다. non-finite center/point 좌표, non-finite radius,
 * `innerRadius < 0`, `outerRadius < 0`, `innerRadius > outerRadius`는 `RangeError`다.
 *
 * @param circle outer radius와 center를 제공하는 circle
 * @param innerRadius hole radius. `circle.radius`(outer) 이하여야 한다
 * @param point annulus까지의 signed distance를 측정할 point
 */
export function sdfAnnulus(circle: CircleLike, innerRadius: number, point: XYInput): number {
  const center = readCircleCenter(circle);
  const cx = requireFiniteX(center, 'annulus center');
  const cy = requireFiniteY(center, 'annulus center');
  const outerRadius = requireNonNegative(readCircleRadius(circle), 'annulus outer radius');
  const inner = requireNonNegative(innerRadius, 'annulus inner radius');
  if (inner > outerRadius) {
    throw new RangeError(`sdf annulus inner radius must not exceed outer radius, got ${inner} > ${outerRadius}`);
  }
  const px = requireFiniteX(point, 'point');
  const py = requireFiniteY(point, 'point');

  const distance = Math.hypot(px - cx, py - cy);

  // innerRadius 0은 hole이 없는 filled disk다. degenerate inner boundary를 만들지 않는다.
  if (inner === 0) return canonicalizeZero(distance - outerRadius);

  return canonicalizeZero(Math.max(inner - distance, distance - outerRadius));
}
