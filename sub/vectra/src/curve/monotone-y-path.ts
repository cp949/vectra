import type { PathCommand, XYInput } from '../types';
import { monotoneYPathInto } from './monotone-y-path-into';

/**
 * y축이 strict monotonic인 point list를 monotone cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * tangent slope는 Fritsch-Carlson(PCHIP) 방식으로 overshoot를 제한한다.
 * 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 빈 배열을 반환한다.
 * 입력 순서가 curve order다. 정렬하지 않는다. x monotonic은 요구하지 않는다.
 * y가 strict monotonic이 아니거나 duplicate면, 또는 좌표가 non-finite면 RangeError로 실패한다.
 * 성능 최적화가 필요하면 `monotoneYPathInto`를 사용한다.
 *
 * @param points y축이 strict monotonic인 입력 point 배열
 * @returns 새로 만든 PathCommand 배열
 */
export function monotoneYPath(points: readonly XYInput[]): PathCommand[] {
  return monotoneYPathInto([], points);
}
