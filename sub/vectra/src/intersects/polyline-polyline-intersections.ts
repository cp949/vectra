import { DEFAULT_EPSILON } from '../internal/numeric';
import type { PolylineLike, XYObjectWritable } from '../types';
import { polylinePolylineIntersectionsInto } from './polyline-polyline-intersections-into';

/**
 * 두 polyline boundary의 교점을 새 배열로 반환한다.
 *
 * `polylinePolylineIntersectionsInto`의 allocating companion이다. polyline은 open path이므로 마지막
 * point에서 첫 point로 닫지 않는다.
 * - transversal crossing은 교점 1점, shared vertex/segment endpoint 중복은 dedupe된 1점이다.
 * - collinear overlap은 clipped overlap start/end 두 점을 노출하고, 두 점이 epsilon 이하로
 *   수렴하면 1점으로 dedupe한다.
 * - zero-length segment는 point relation으로 환원하지 않고 건너뛴다. 두 polyline이 모두 valid
 *   segment가 없으면 빈 배열이다.
 * - `points.length < 2`, 좌표가 하나라도 non-finite이면 빈 배열이다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 대응 `Into`는
 * `outPoints`가 subject/target polyline array와 같은 reference여도 alias-safe하도록 clear 전에 입력
 * 좌표를 snapshot한다. subject와 target이 같은 object여도 입력 좌표를 그대로 재사용하지 않는다. 반환
 * 순서는 subject segment index 오름차순이고, 같은 subject segment 안에서는 subject segment-local
 * parameter `t` 오름차순이다(target segment index는 동률 tie-break). `epsilon`은 평행/거리/dedupe
 * 판정에만 쓰고 finite validation에는 쓰지 않는다. range 판정은 segment-local parameter의 정확 비교를
 * 따른다.
 *
 * @param subject 첫 번째 polyline. point ordering의 기준이다.
 * @param target 두 번째 polyline
 * @param epsilon 평행/거리/dedupe 판정 임계값
 */
export function polylinePolylineIntersections(
  subject: PolylineLike,
  target: PolylineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  polylinePolylineIntersectionsInto(out, subject, target, epsilon);
  return out;
}
