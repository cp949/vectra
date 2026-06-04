import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, XYWritable } from '../types';

/**
 * turn * 2π 각도 위치의 circle 표면 point를 out에 기록하고 out을 반환한다.
 *
 * turn은 wrap하지 않고 그대로 사용한다. radius <= 0인 empty circle은 center를 기록한다.
 *
 * @param out 표면 point를 기록할 writable output
 * @param circle 표면 point를 계산할 circle
 * @param turn normalized angle fraction (turn = angle / (2π))
 */
export function pointAtTurnInto<Out extends XYWritable>(out: Out, circle: CircleLike, turn: number): Out {
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);

  if (r <= 0) return writeXY(out, cx, cy);

  const angle = turn * 2 * Math.PI;
  return writeXY(out, cx + r * Math.cos(angle), cy + r * Math.sin(angle));
}
