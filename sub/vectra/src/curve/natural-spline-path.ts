import type { PathCommand, XYInput } from '../types';
import { naturalSplinePathInto } from './natural-spline-path-into';

/**
 * point list를 통과하는 natural cubic spline을 cubic Bezier PathCommand[]로 변환한 새 배열을 반환한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * endpoint second derivative는 0이다. 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 빈 배열을 반환한다. points.length === 2이면 line segment와 동일하다.
 * 좌표가 non-finite거나 tridiagonal solve가 실패하면 RangeError로 실패한다.
 * 성능 최적화가 필요하면 `naturalSplinePathInto`를 사용한다.
 *
 * @param points natural spline이 통과할 입력 point 배열
 * @returns 새로 만든 PathCommand 배열
 */
export function naturalSplinePath(points: readonly XYInput[]): PathCommand[] {
  return naturalSplinePathInto([], points);
}
