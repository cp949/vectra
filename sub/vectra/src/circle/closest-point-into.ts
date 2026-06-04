import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, XYInput, XYWritable } from '../types';

/**
 * circle 표면에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * empty circle은 center를 기록한다. point가 center와 같으면 angle 0 위치인 (center.x + radius,
 * center.y)를 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out closest point를 기록할 writable output
 * @param circle closest point를 계산할 circle
 * @param point circle 표면에 투영할 point
 */
export function closestPointInto<Out extends XYWritable>(out: Out, circle: CircleLike, point: XYInput): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);
  const px = readX(point);
  const py = readY(point);

  if (r <= 0) return writeXY(out, cx, cy);

  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy);

  // dist === 0이면 angle 0 위치 (cx+r, cy)를 fallback으로 기록한다
  if (dist === 0) return writeXY(out, cx + r, cy);

  return writeXY(out, cx + (dx / dist) * r, cy + (dy / dist) * r);
}
