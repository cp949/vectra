import { DEFAULT_EPSILON } from '../internal/numeric';
import { readPolygonPoints } from '../internal/polygon';
import type { PolygonLike } from '../types';
import { ringHasZeroLengthEdge, ringSelfIntersects } from './self-intersection.internal';

/**
 * polygon이 simple polygon인지 반환한다.
 *
 * vertex가 3개 이상이고 self-intersection이 없으면 true다. structural empty polygon
 * (pointCount < 3)은 simple polygon이 아니므로 false다. self-intersection 판정은 implicit closed
 * ring의 non-adjacent edge pair 교차/접촉/overlap을 본다. 인접 edge가 공유하는 vertex(첫 edge와
 * 마지막 edge가 공유하는 vertex 포함)는 정상으로 본다.
 * repair나 normalize는 하지 않는다. consecutive repeated point나 첫 vertex를 끝에 다시 넣은
 * explicit-closed 입력처럼 zero-length edge가 있으면 simple polygon이 아니다.
 * 입력을 mutate하지 않는다.
 *
 * @param polygon simple polygon 여부를 검사할 polygon
 * @param epsilon self-intersection 판정용 cross product 절대값 임계값이다. `|cross| <= epsilon`이면
 *   parallel/collinear로 본다. normalize되지 않은 절대값이라 좌표 scale에 의존한다. 큰 epsilon에서는
 *   마주보는 near-parallel edge가 overlap으로 합쳐져 false가 될 수 있고, 매우 작은 좌표 scale에서는
 *   실제 교차를 놓쳐 true가 될 수 있다. zero-length edge 판정에는 적용되지 않는다. 기본값은
 *   DEFAULT_EPSILON이다.
 */
export function isSimple(polygon: PolygonLike, epsilon = DEFAULT_EPSILON): boolean {
  const pts = readPolygonPoints(polygon);
  if (pts.length < 3) return false;
  // zero-length edge 판정은 길이 임계값이다. caller epsilon은 cross product(면적) 단위라 길이와
  // 혼용하면 안 되므로, segment domain의 isZeroLength처럼 고정 DEFAULT_EPSILON 길이 임계값을 쓴다.
  if (ringHasZeroLengthEdge(pts, DEFAULT_EPSILON)) return false;
  return !ringSelfIntersects(pts, epsilon);
}
