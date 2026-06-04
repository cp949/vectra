import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readX, readY } from '../internal/xy';
import type { EllipseLike, RayLike, XYObjectWritable } from '../types';

/**
 * ray와 ellipse circumference의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * single-intersection helper와 달리 range(`t ≥ 0`) 안 교점이 2개여도 두 점을 모두 push한다.
 * - tangent는 접점 t가 range(`t ≥ 0`) 안일 때만 중복 없이 한 점이고, range 밖이면 빈 배열이다.
 * - proper two-point는 두 점을 ray parameter `t` 오름차순으로 push한다.
 * - ray origin이 ellipse 내부이면 t ≥ 0 exit 교점 1개만 push한다.
 * - 두 root가 모두 ray 뒤(t < 0)이면 빈 배열, contained(boundary root 없음), degenerate direction
 *   (zero-length), empty ellipse(radiusX ≤ 0 또는 radiusY ≤ 0)도 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayEllipseIntersectionsInto(
  outPoints: XYObjectWritable[],
  ray: RayLike,
  ellipse: EllipseLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const center = readEllipseCenter(ellipse);
  return lineFamilyEllipseIntersectionPoints(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    readX(center),
    readY(center),
    readEllipseRadiusX(ellipse),
    readEllipseRadiusY(ellipse),
    epsilon
  );
}
