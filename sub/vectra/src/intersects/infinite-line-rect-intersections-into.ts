import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import type { InfiniteLine, Rect, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 rect boundary의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다.
 * - 양방향 transversal crossing 2점, corner touch 1점(dedupe), edge collinear overlap은 start/end
 *   2점이다.
 * - empty rect(width ≤ 0 또는 height ≤ 0), degenerate direction(`dx = dy = 0`)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 line parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function infiniteLineRectIntersectionsInto(
  outPoints: PointWritable[],
  line: InfiniteLine,
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
    line.ox,
    line.oy,
    line.dx,
    line.dy,
    'inf',
    rx,
    ry,
    rx + rw,
    ry + rh,
    epsilon
  );
}
