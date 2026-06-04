import type { PathCommand, XYInput } from '../types';
import { bumpCubicSegments } from './bump.internal';
import { cubicSegmentsToPathInto } from './curve-segments.internal';

/**
 * point list를 수평 bump cubic Bezier PathCommand[]로 변환해 out에 기록하고 out을 반환한다.
 *
 * 각 segment p0→p1의 control point는 c1=(midX,y0), c2=(midX,y1) (midX=(x0+x1)/2)이다.
 * 결과는 move 1개 뒤 cubic command로 구성된다. close는 추가하지 않는다.
 * points.length < 2이면 out.length를 0으로 두고 반환한다.
 * non-finite 좌표는 산술 결과 그대로 pass-through한다.
 * polyline이 필요하면 caller가 path domain의 flatten helper를 사용한다.
 *
 * @param out command를 기록할 PathCommand 배열. 기존 내용은 덮어쓴다.
 * @param points bump curve가 통과할 입력 point 배열
 * @returns out
 */
export function bumpXPathInto<Out extends PathCommand[]>(out: Out, points: readonly XYInput[]): Out {
  out.length = 0;
  if (points.length < 2) return out;
  const { segments, segCount } = bumpCubicSegments(points, 'x');
  return cubicSegmentsToPathInto(out, segments, segCount);
}
