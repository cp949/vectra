import type { MonotonePolylineOptions } from '../types';
import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { cubicSegmentsToPolylineInto } from './curve-segments.internal';
import { monotoneCubicSegments } from './monotone.internal';

const DEFAULT_STEPS = 16;

/**
 * x축이 strict monotonic인 point list를 monotone cubic을 segment당 균등 샘플링해 out에 point로 기록하고 out을 반환한다.
 *
 * tangent slope는 Fritsch-Carlson(PCHIP) 방식으로 overshoot를 제한한다.
 * 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 * 입력 순서가 curve order다. 정렬하지 않는다.
 * x가 strict monotonic이 아니거나 duplicate면, 또는 좌표가 non-finite면 RangeError로 실패한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패한다.
 *
 * @param out 점을 기록할 점 배열. 기존 내용은 덮어쓴다.
 * @param points x축이 strict monotonic인 입력 point 배열
 * @param options 구간별 표본 수 옵션. 생략하면 16점을 기록한다.
 * @returns out
 */
export function monotoneXPolylineInto(
  out: PointWritable[],
  points: readonly Point[],
  options?: Required<MonotonePolylineOptions>
): PointWritable[] {
  const steps = options === undefined ? DEFAULT_STEPS : options.steps;
  if (points.length < 2) {
    out.length = 0;
    return out;
  }
  const { segments, segCount } = monotoneCubicSegments(points, 'x');
  return cubicSegmentsToPolylineInto(out, segments, segCount, steps);
}
