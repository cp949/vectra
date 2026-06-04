import type { MonotonePolylineOptions, XYInput, XYObjectWritable } from '../types';
import { monotoneXPolylineInto } from './monotone-x-polyline-into';

/**
 * x축이 strict monotonic인 point list를 monotone cubic을 segment당 균등 샘플링한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * tangent slope는 Fritsch-Carlson(PCHIP) 방식으로 overshoot를 제한한다.
 * 첫 segment만 시작점을 포함하고 후속 segment는 연결점 중복을 피한다.
 * points.length < 2이면 빈 배열을 반환한다.
 * 입력 순서가 curve order다. 정렬하지 않는다.
 * x가 strict monotonic이 아니거나 duplicate면, 또는 좌표가 non-finite면 RangeError로 실패한다.
 * steps가 safe integer가 아니거나 1 미만이면 RangeError로 실패한다.
 * 성능 최적화가 필요하면 `monotoneXPolylineInto`를 사용한다.
 *
 * @param points x축이 strict monotonic인 입력 point 배열
 * @param stepsOrOptions segment당 sample 수 또는 옵션 객체. 기본값 16.
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function monotoneXPolyline(
  points: readonly XYInput[],
  stepsOrOptions?: number | MonotonePolylineOptions
): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  monotoneXPolylineInto(out, points, stepsOrOptions);
  return out;
}
