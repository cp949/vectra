import type { Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * 시작점 + t * (끝점 - 시작점) 위치를 unclamped로 out에 기록하고 out을 반환한다.
 *
 * @param out 위치를 기록할 점 객체
 * @param line 대상 segment
 * @param t parametric 위치. [0, 1] 밖의 값도 clamp 없이 그대로 계산한다
 */
export function pointAtTInto<Out extends PointWritable>(out: Out, line: Segment, t: number): Out {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  out.x = ax + t * dx;
  out.y = ay + t * dy;
  return out;
}
