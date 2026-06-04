import type { PathCommand, XYInput } from '../types';
import { cubicSegmentsToPathInto } from './curve-segments.internal';
import { naturalSplineCubicSegments } from './natural-spline.internal';

/**
 * point list를 통과하는 natural cubic spline을 cubic Bezier PathCommand[]로 변환해 out에 기록하고 out을 반환한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * endpoint second derivative는 0이다. 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다. points.length === 2이면 line segment와 동일하다.
 * 좌표가 non-finite거나 tridiagonal solve가 실패하면 RangeError로 실패한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points natural spline이 통과할 입력 point 배열
 * @returns out
 */
export function naturalSplinePathInto<Out extends PathCommand[]>(out: Out, points: readonly XYInput[]): Out {
  out.length = 0;
  if (points.length < 2) return out;
  const { segments, segCount } = naturalSplineCubicSegments(points);
  return cubicSegmentsToPathInto(out, segments, segCount);
}
