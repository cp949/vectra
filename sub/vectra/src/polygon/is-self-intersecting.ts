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
 * @param epsilon 판정 임계값이다. 생략하면 두 edge가 `sin θ <= DEFAULT_EPSILON`일 때 parallel/collinear로
 *   보므로 좌표 scale에 불변이다. 명시하면 `|cross| <= epsilon`(normalize되지 않은 절대값)이면
 *   parallel/collinear로 보므로 좌표 scale에 의존한다. 큰 명시 epsilon에서는 마주보는 near-parallel edge가
 *   overlap으로 합쳐져 true가 될 수 있고, 작은 좌표 scale에서는 실제 교차도 cross가 epsilon 이하가 되어
 *   parallel로 합쳐지면서 false가 될 수 있다.
 */
export function isSelfIntersecting(polygon: PolygonLike, epsilon?: number): boolean {
  return ringSelfIntersects(readPolygonPoints(polygon), epsilon);
}
