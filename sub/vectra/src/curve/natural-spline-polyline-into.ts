import type { NaturalSplinePolylineOptions, XYInput, XYWritable } from '../types';
import { cubicSegmentsToPolylineInto } from './curve-segments.internal';
import { naturalSplineCubicSegments } from './natural-spline.internal';

const DEFAULT_STEPS = 16;

/**
 * point list를 통과하는 natural cubic spline을 segment당 균등 샘플링해 out에 point로 기록하고 out을 반환한다.
 *
 * x/y를 각각 index parameter 기준으로 natural spline 처리한다. x monotonic은 요구하지 않는다.
 * endpoint second derivative는 0이다. 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다. points.length === 2이면 line segment와 동일하다.
 * 좌표가 non-finite거나 tridiagonal solve가 실패하면 RangeError로 실패한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패한다.
 *
 * @param out point를 기록할 writable point 배열. 기존 내용은 덮어쓴다.
 * @param points natural spline이 통과할 입력 point 배열
 * @param stepsOrOptions segment당 sample 수 또는 옵션 객체. 기본값 16.
 * @returns out
 */
export function naturalSplinePolylineInto(
  out: XYWritable[],
  points: readonly XYInput[],
  stepsOrOptions?: number | NaturalSplinePolylineOptions
): XYWritable[] {
  const steps = typeof stepsOrOptions === 'number' ? stepsOrOptions : (stepsOrOptions?.steps ?? DEFAULT_STEPS);
  if (points.length < 2) {
    out.length = 0;
    return out;
  }
  const { segments, segCount } = naturalSplineCubicSegments(points);
  return cubicSegmentsToPolylineInto(out, segments, segCount, steps);
}
