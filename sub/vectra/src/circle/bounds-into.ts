import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, CircleLike, XYWritable } from '../types';

/**
 * circle을 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * radius <= 0인 empty circle은 sentinel empty bounds를 기록한다. input과 out이 같은 object여도
 * 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param circle bounds로 변환할 circle
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, circle: CircleLike): Out {
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  const r = readCircleRadius(circle);

  if (r <= 0) {
    // empty circle: sentinel empty bounds
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  writeXY(out.min, cx - r, cy - r);
  writeXY(out.max, cx + r, cy + r);
  return out;
}
