import type { PathCommand, XYInput } from '../types';
import { cubicSegmentsToPathInto } from './curve-segments.internal';
import { monotoneCubicSegments } from './monotone.internal';

/**
 * x축이 strict monotonic인 point list를 monotone cubic Bezier PathCommand[]로 변환해 out에 기록하고 out을 반환한다.
 *
 * tangent slope는 Fritsch-Carlson(PCHIP) 방식으로 overshoot를 제한한다.
 * 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 * 입력 순서가 curve order다. 정렬하지 않는다.
 * x가 strict monotonic이 아니거나 duplicate면, 또는 좌표가 non-finite면 RangeError로 실패한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points x축이 strict monotonic인 입력 point 배열
 * @returns out
 */
export function monotoneXPathInto<Out extends PathCommand[]>(out: Out, points: readonly XYInput[]): Out {
  out.length = 0;
  if (points.length < 2) return out;
  const { segments, segCount } = monotoneCubicSegments(points, 'x');
  return cubicSegmentsToPathInto(out, segments, segCount);
}
