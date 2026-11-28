import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import type { Ray, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * ray와 rect boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다.
 * - transversal crossing, corner touch 1점(dedupe), edge collinear overlap은 start/end 2점이다.
 * - ray 시작점 (ox, oy)가 rect 내부면 t ≥ 0 exit 교점만 반환한다. boundary 교점이 없으면 빈 배열이다.
 * - empty rect(width ≤ 0 또는 height ≤ 0), degenerate direction(`dx = dy = 0`)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 ray parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ray (ox, oy)에서 (dx, dy) 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function rayRectIntersectionsInto(
  outPoints: PointWritable[],
  ray: Ray,
  rect: Rect,
  epsilon?: number
): PointWritable[] {
  const rw = rect.width;
  const rh = rect.height;
  outPoints.length = 0;
  if (rw <= 0 || rh <= 0) return outPoints;
  const rx = rect.x;
  const ry = rect.y;
  return lineFamilyBoxIntersectionPoints(
    outPoints,
    ray.ox,
    ray.oy,
    ray.dx,
    ray.dy,
    'ray',
    rx,
    ry,
    rx + rw,
    ry + rh,
    epsilon
  );
}
