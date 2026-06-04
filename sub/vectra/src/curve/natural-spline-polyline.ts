import type { NaturalSplinePolylineOptions, XYInput, XYObjectWritable } from '../types';
import { naturalSplinePolylineInto } from './natural-spline-polyline-into';

/**
 * point list를 통과하는 natural cubic spline을 segment당 균등 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * endpoint second derivative는 0이다. 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * points.length < 2이면 빈 배열을 반환한다. points.length === 2이면 line segment와 동일하다.
 * 좌표가 non-finite거나 tridiagonal solve가 실패하면 RangeError로 실패한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패한다.
 * 성능 최적화가 필요하면 `naturalSplinePolylineInto`를 사용한다.
 *
 * @param points natural spline이 통과할 입력 point 배열
 * @param stepsOrOptions segment당 sample 수 또는 옵션 객체. 기본값 16.
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function naturalSplinePolyline(
  points: readonly XYInput[],
  stepsOrOptions?: number | NaturalSplinePolylineOptions
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  naturalSplinePolylineInto(out, points, stepsOrOptions);
  return out;
}
