import type { Polygon, Point, PolygonWritable } from '../types/flat-shapes.internal';
import { sortPointsByAngleInto } from './sort-points-by-angle-into';

/**
 * point set을 center 기준 polar angle 순서로 정렬한 새 polygon 좌표 배열을 반환한다.
 *
 * `atan2(y - cy, x - cx)` 오름차순으로 정렬한다. convex hull이 아니며 duplicate point도 모두 유지한다.
 * 기본 center는 입력 point의 arithmetic mean이고, `options.center`를 주면 그 좌표를 center로 쓴다.
 * angle이 같으면 center로부터 squared distance 오름차순 → 원래 index 순서로 tie-break한다.
 * non-finite 좌표로 angle이 `NaN`이 되는 point는 finite-angle point 뒤에 원래 순서로 둔다.
 * 기본 center에서 어떤 point라도 non-finite면 center가 `NaN`이 되어 전체 angle이 `NaN` → 원래 순서를 보존한다.
 * `n === 0`이면 빈 배열, `n === 1`이면 해당 point 1개를 반환한다.
 * 대응 `sortPointsByAngleInto`는 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
 *
 * @param points 정렬할 polygon 좌표 배열
 * @param options polar angle 기준 중심점. 생략하면 vertex의 산술 평균을 쓴다
 */
export function sortPointsByAngle(points: Polygon, options?: { readonly center: Point }): PolygonWritable {
  return sortPointsByAngleInto([], points, options);
}
