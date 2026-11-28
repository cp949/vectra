import { DEFAULT_EPSILON } from '../internal/numeric';
import type { Ray, Triangle, PointWritable } from '../types/flat-shapes.internal';
import { triangleLineFamilyIntersectionsInto } from './triangle-line-family-intersections.internal';

/**
 * triangle과 ray boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle 3개 edge(A-B, B-C, C-A)와의 교점을 모으고 vertex/edge 중복을 dedupe한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - ray 시작점 (ox, oy)가 triangle 내부면 t ≥ 0 exit 교점만 반환한다. boundary 교점이 없으면 빈 배열이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, `dx = dy = 0`인 direction, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 ray parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은 ray parameter의 정확 비교를 따른다.
 * finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 ray parameter다.
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleRayIntersectionsInto(
  outPoints: PointWritable[],
  triangle: Triangle,
  ray: Ray,
  epsilon = DEFAULT_EPSILON
): PointWritable[] {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return triangleLineFamilyIntersectionsInto(
    outPoints,
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    'ray',
    ax,
    ay,
    bx,
    by,
    cx,
    cy,
    epsilon
  );
}
