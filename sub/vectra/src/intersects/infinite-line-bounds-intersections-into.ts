import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import type { Bounds, InfiniteLine, PointWritable } from '../types/flat-shapes.internal';

/**
 * infinite-line과 bounds boundary의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * bounds boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다. rect helper와 계산은 같으나
 * empty 기준이 다르다: rect는 width/height ≤ 0을 empty로 보고, bounds는 inverted(max < min)만 empty로
 * 보아 zero-extent(점·선) bounds도 유효 입력으로 처리한다.
 * - 양방향 transversal crossing 2점, corner touch 1점(dedupe), edge collinear overlap은 start/end
 *   2점이다.
 * - inverted bounds(max < min), degenerate direction(`dx = dy = 0`)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 line parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function infiniteLineBoundsIntersectionsInto(
  outPoints: PointWritable[],
  line: InfiniteLine,
  bounds: Bounds,
  epsilon?: number
): PointWritable[] {
  const x0 = bounds.minX;
  const y0 = bounds.minY;
  const x1 = bounds.maxX;
  const y1 = bounds.maxY;
  outPoints.length = 0;
  if (x1 < x0 || y1 < y0) return outPoints;
  return lineFamilyBoxIntersectionPoints(outPoints, line.ox, line.oy, line.dx, line.dy, 'inf', x0, y0, x1, y1, epsilon);
}
