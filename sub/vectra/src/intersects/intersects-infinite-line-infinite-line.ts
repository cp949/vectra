import { infiniteLineToLineFamilyParam, lineFamilyIntersects } from '../internal/line-family';
import type { InfiniteLine } from '../types/flat-shapes.internal';

/**
 * 두 infinite-line이 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * 동일 직선 (collinear): true.
 * `dx = dy = 0`인 degenerate infinite-line은 점으로 환원해 다른 쪽 직선의 containment로 판정한다.
 *
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon 평행 판정 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsInfiniteLineInfiniteLine(a: InfiniteLine, b: InfiniteLine, epsilon?: number): boolean {
  return lineFamilyIntersects(
    infiniteLineToLineFamilyParam(a.ox, a.oy, a.dx, a.dy),
    infiniteLineToLineFamilyParam(b.ox, b.oy, b.dx, b.dy),
    epsilon
  );
}
