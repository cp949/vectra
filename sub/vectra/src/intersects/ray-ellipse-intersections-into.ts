import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ellipse, Ray, PointWritable } from '../types/flat-shapes.internal';

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
 * object다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param ellipse 교점을 구할 ellipse
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayEllipseIntersectionsInto<Out extends PointWritable[]>(
  outPoints: Out,
  ray: Ray,
  ellipse: Ellipse,
  epsilon = DEFAULT_EPSILON
): Out {
  lineFamilyEllipseIntersectionPoints(
    outPoints,
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    'ray',
    ellipse.cx,
    ellipse.cy,
    ellipse.rx,
    ellipse.ry,
    epsilon
  );
  return outPoints;
}
