import type { Circle, PointWritable } from '../types/flat-shapes.internal';

/**
 * turn * 2π 각도 위치의 circle 표면 point를 out에 기록하고 out을 반환한다.
 *
 * turn은 wrap하지 않고 그대로 사용한다. radius <= 0인 empty circle은 center를 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param circle 표면 point를 계산할 circle
 * @param turn normalized angle fraction (turn = angle / (2π))
 */
export function pointAtTurnInto<Out extends PointWritable>(out: Out, circle: Circle, turn: number): Out {
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;

  if (r <= 0) {
    out.x = cx;
    out.y = cy;
    return out;
  }

  const angle = turn * 2 * Math.PI;
  out.x = cx + r * Math.cos(angle);
  out.y = cy + r * Math.sin(angle);
  return out;
}
