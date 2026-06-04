import { DEFAULT_EPSILON } from '../internal/numeric';
import { readPolygonPoints } from '../internal/polygon';
import type { PolygonLike } from '../types';
import { ringSelfIntersects } from './self-intersection.internal';

/**
 * polygon이 self-intersecting인지 반환한다.
 *
 * implicit closed ring의 non-adjacent edge pair가 교차하거나, 한 점에서 닿거나, collinear로
 * 겹치면 true다. ring에서 인접한 edge가 공유하는 vertex(첫 edge와 마지막 edge가 공유하는 vertex
 * 포함)는 self-intersection으로 보지 않는다. vertex가 4개 미만이면 non-adjacent edge pair가
 * 없으므로 항상 false다.
 * repair나 normalize는 하지 않는다. vertex가 4개 이상인 ring에서 consecutive repeated point가 만든
 * zero-length edge는 양옆 non-adjacent edge가 한 점을 공유하게 만들어 true로 판정한다. ring은
 * implicit closed이므로 첫 vertex를 끝에 다시 넣은 explicit-closed 입력도 같은 이유로 true다.
 * 입력을 mutate하지 않는다.
 *
 * @param polygon self-intersection을 검사할 polygon
 * @param epsilon 두 edge 방향 벡터 cross product 절대값 임계값이다. `|cross| <= epsilon`이면
 *   parallel/collinear로 본다. normalize되지 않은 절대값이라 좌표 scale에 의존한다. 큰 epsilon에서는
 *   마주보는 near-parallel edge가 overlap으로 합쳐져 true가 될 수 있고, 매우 작은 좌표 scale에서는
 *   실제 교차도 cross가 epsilon 이하가 되어 parallel로 합쳐지면서 false가 될 수 있다. 기본값은
 *   DEFAULT_EPSILON이다.
 */
export function isSelfIntersecting(polygon: PolygonLike, epsilon = DEFAULT_EPSILON): boolean {
  return ringSelfIntersects(readPolygonPoints(polygon), epsilon);
}
