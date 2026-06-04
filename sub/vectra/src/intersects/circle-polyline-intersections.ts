import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CircleLike, PolylineLike, XYObjectWritable } from '../types';
import { circlePolylineIntersectionsInto } from './circle-polyline-intersections-into';

/**
 * circle circumference와 polyline의 교점을 새 배열로 반환한다.
 *
 * `circlePolylineIntersectionsInto`의 allocating companion이다. polyline은 open path이므로 마지막
 * point에서 첫 point로 닫지 않는다.
 * - proper two-point는 segment-local parameter `t` 오름차순 두 점, tangent는 접점 t가 range 안일 때
 *   1점이다.
 * - circle disk 내부에 segment가 완전히 포함되면(boundary root 없음) 빈 배열이다. circumference root만
 *   노출하고 disk containment은 점으로 보지 않는다.
 * - 인접 segment가 같은 circle point를 보고하면 same-point dedupe로 1점만 남긴다.
 * - zero-length polyline segment는 point relation으로 환원하지 않고 건너뛴다.
 * - empty circle(`radius <= 0`), `points.length < 2`, 좌표가 하나라도 non-finite(circle center/radius
 *   또는 polyline 좌표)이면 빈 배열이다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 대응 `Into`는
 * `outPoints`가 polyline array와 같은 reference여도 alias-safe하도록 clear 전에 입력 좌표를
 * snapshot한다. 반환 순서는 polyline segment index 오름차순이고, 같은 segment 안에서는 segment-local
 * parameter `t` 오름차순이다. `epsilon`은 discriminant tangent/dedupe 판정에만 쓰고 finite validation에는
 * 쓰지 않는다. range 판정은 segment-local parameter의 정확 비교를 따른다.
 *
 * @param circle 교점을 구할 circle
 * @param polyline 교점을 구할 polyline. point ordering의 기준이다.
 * @param epsilon discriminant tangent/dedupe 판정 임계값
 */
export function circlePolylineIntersections(
  circle: CircleLike,
  polyline: PolylineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  circlePolylineIntersectionsInto(out, circle, polyline, epsilon);
  return out;
}
