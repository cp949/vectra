import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CircleLike, XYObjectWritable } from '../types';
import { circleCircleIntersectionsInto } from './circle-circle-intersections-into';

/**
 * 두 circle circumference의 교점을 새 배열로 반환한다.
 *
 * `circleCircleIntersectionsInto`의 allocating companion이다. point relation만 점으로 노출한다.
 * - tangent는 한 점, proper two-point는 circle `a` 기준 turn 오름차순 두 점을 반환한다.
 * - 외부 분리, containment, coincident overlap, radius ≤ 0, non-finite는 빈 배열을 반환한다.
 *
 * 반환 point는 매 호출 새 `{ x, y }` object이며 입력 center object를 재사용하지 않는다.
 * `epsilon`은 center distance 비교와 tangent 판정에만 쓰고 finite validation에는 쓰지 않는다.
 * 계산은 공통 scale로 정규화해 `d²`/`r²` overflow를 피한다.
 * `epsilon`은 절대 임계값이며 두 radius보다 충분히 작다고 가정한다. radius가 `epsilon` 규모 이하면
 * 분리/접선 경계가 합쳐져 분리된 circle을 점으로 분류할 수 있다.
 *
 * @param a 첫 번째 circle. point ordering의 기준이다.
 * @param b 두 번째 circle
 * @param epsilon center distance 및 tangent 판정 임계값
 */
export function circleCircleIntersections(a: CircleLike, b: CircleLike, epsilon = DEFAULT_EPSILON): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  circleCircleIntersectionsInto(out, a, b, epsilon);
  return out;
}
