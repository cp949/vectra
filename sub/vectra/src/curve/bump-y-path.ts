import type { PathCommand, XYInput } from '../types';
import { bumpYPathInto } from './bump-y-path-into';

/**
 * point list를 수직 bump cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * 각 segment p0→p1의 control point는 c1=(x0,midY), c2=(x1,midY) (midY=(y0+y1)/2)이다.
 * 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 빈 배열을 반환한다.
 * non-finite 좌표는 산술 결과 그대로 pass-through한다.
 * polyline이 필요하면 caller가 path domain의 flatten helper를 사용한다.
 * 성능 최적화가 필요하면 `bumpYPathInto`를 사용한다.
 *
 * @param points bump curve가 통과할 입력 point 배열
 * @returns 새로 만든 PathCommand 배열
 */
export function bumpYPath(points: readonly XYInput[]): PathCommand[] {
  return bumpYPathInto([], points);
}
