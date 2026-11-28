import { DEFAULT_EPSILON } from '../internal/numeric';
import { rayCirclePointsInto } from '../internal/ray-circle-points.internal';
import type { Circle, Ray, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 circle circumference의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * circle을 rx = ry = r인 ellipse로 환원해 line-family × ellipse 정책과 동일하게 계산한다.
 * single-intersection helper와 달리 range(`t ≥ 0`) 안 교점이 2개여도 두 점을 모두 push한다.
 * - tangent는 접점 t가 range 안일 때만 중복 없이 한 점이고, range 밖이면 빈 배열이다.
 * - proper two-point는 두 점을 ray parameter `t` 오름차순으로 push한다.
 * - ray 시작점 (ox, oy)가 circle 내부이면 t ≥ 0 exit 교점 1개만 push한다.
 * - 두 root가 모두 ray 뒤(t < 0)이면 빈 배열, contained(boundary root 없음), degenerate direction
 *   (`dx = dy = 0`), empty circle(r ≤ 0)도 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }`
 * object다.
 * `epsilon`은 discriminant tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점을 기록할 배열. 기존 내용은 비우고 { x, y } 점을 넣는다.
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param circle 교점을 구할 circle
 * @param epsilon discriminant tangent 판정 임계값
 */
export function rayCircleIntersectionsInto(
  outPoints: PointWritable[],
  ray: Ray,
  circle: Circle,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  rayCirclePointsInto(outPoints, ray.ox, ray.oy, ray.dx, ray.dy, circle.cx, circle.cy, circle.r, epsilon);
  return outPoints;
}
