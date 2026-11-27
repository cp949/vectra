import type { NaturalSplinePolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { cubicSegmentsToPolylineInto } from './curve-segments.internal';
import { naturalSplineCubicSegments } from './natural-spline.internal';

const DEFAULT_STEPS = 16;

/**
 * point list를 통과하는 natural cubic spline을 segment당 균등 샘플링해 out에 point로 기록하고 out을 반환한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * endpoint second derivative는 0이다. 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다. points.length === 2이면 line segment와 동일하다.
 * 좌표가 non-finite면 RangeError로 실패한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패한다.
 *
 * @param out 점을 기록할 점 배열. 기존 내용은 덮어쓴다.
 * @param points natural spline이 통과할 입력 point 배열
 * @param options 구간별 표본 수 옵션. 생략하면 16점을 기록한다.
 * @returns out
 */
export function naturalSplinePolylineInto(
  out: PointWritable[],
  points: readonly Point[],
  options?: Required<NaturalSplinePolylineOptions>
): PointWritable[] {
  const steps = options === undefined ? DEFAULT_STEPS : options.steps;
  if (points.length < 2) {
    out.length = 0;
    return out;
  }
  const { segments, segCount } = naturalSplineCubicSegments(points);
  return cubicSegmentsToPolylineInto(out, segments, segCount, steps);
}
