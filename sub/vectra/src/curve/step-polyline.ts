import type { StepCurveOptions, XYInput, XYObjectWritable } from '../types';
import { stepPolylineInto } from './step-polyline-into';

/**
 * point list를 orthogonal step polyline으로 변환한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * 기본 mode는 'middle'. segment p0→p1에서 'middle'은 midX=(x0+x1)/2의 (midX,y0),(midX,y1),
 * 'before'는 (x1,y0), 'after'는 (x0,y1) elbow를 거쳐 끝점에 도달한다.
 * points.length < 2이면 빈 배열을 반환한다.
 * consecutive duplicate point는 제거하지 않는다. non-finite 좌표는 산술 결과 그대로 pass-through한다.
 * invalid mode는 RangeError로 실패한다.
 * 성능 최적화가 필요하면 `stepPolylineInto`를 사용한다.
 *
 * @param points step polyline이 통과할 입력 point 배열
 * @param options step elbow mode 옵션. mode 기본값 'middle'.
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function stepPolyline(points: readonly XYInput[], options?: StepCurveOptions): XYObjectWritable[] {
  const out: XYObjectWritable[] = [];
  stepPolylineInto(out, points, options);
  return out;
}
