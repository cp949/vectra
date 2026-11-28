import { lineFamilyPolygonOverlapIntervalsInto } from '../internal/polygon-line-intersections';
import type { LinePolygonOverlapIntervalDetail } from '../types';
import type { Polygon, Ray } from '../types/flat-shapes.internal';

/**
 * ray와 polygon edge의 collinear overlap 구간을 outIntervals에 기록하고 같은 outIntervals를 반환한다.
 *
 * `rayPolygonIntersections`가 overlap을 끝점 2건으로 노출하는 것과 달리 양의 길이를 가진 단일 interval로
 * 노출한다. 각 interval은 `LinePolygonOverlapIntervalDetail`이며 `start`/`end`=구간 끝점,
 * `tLineStart`/`tLineEnd`=ray parameter `[0, ∞)`로 clipping된 구간(`tLineStart <= tLineEnd`),
 * `tEdgeStart`/`tEdgeEnd`=각 끝점의 edge-local parameter `[0, 1]`, `edgeIndex`=polygon edge index다.
 *
 * - ray는 `tLine >= 0` 구간만 포함한다. ray 뒤쪽 overlap은 제외하고 일부만 겹치면 시작점 (ox, oy)부터 clipping한다.
 * - ray가 polygon edge와 collinear로 겹칠 때만 interval을 만든다.
 * - transversal crossing, vertex touch, containment-only는 빈 배열이다.
 * - 한 점으로 수렴하는 overlap은 빈 배열이다.
 * - empty polygon(`좌표 수 < 6`)과 degenerate ray(`dx = dy = 0`)은 빈 배열이다.
 *
 * outIntervals는 먼저 clear되고 결과 interval이 `tLineStart` 오름차순으로 push된다. push되는 interval과
 * nested `start`/`end` point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 * `epsilon`은 collinear/수렴 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outIntervals 겹침 구간을 기록할 배열. 기존 내용은 비우고 LinePolygonOverlapIntervalDetail을 넣는다. start와 end는 { x, y }다.
 * @param ray 교차를 구할 ray
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function rayPolygonOverlapIntervalsInto(
  outIntervals: LinePolygonOverlapIntervalDetail[],
  ray: Ray,
  polygon: Polygon,
  epsilon?: number
): LinePolygonOverlapIntervalDetail[] {
  lineFamilyPolygonOverlapIntervalsInto(outIntervals, ray.ox, ray.oy, ray.dx, ray.dy, 'ray', polygon, epsilon);
  return outIntervals;
}
