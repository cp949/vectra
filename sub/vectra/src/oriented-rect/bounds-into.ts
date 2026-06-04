import {
  readOrientedRectAngle,
  readOrientedRectCenter,
  readOrientedRectSize,
  validateOrientedRectSizeAndAngle,
} from '../internal/oriented-rect';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, OrientedRectLike, XYWritable } from '../types';

/**
 * oriented rect를 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * 회전된 corner의 min/max로 AABB를 구한다. center 기준 half-extent는
 * `ex = |hw*cos| + |hh*sin|`, `ey = |hw*sin| + |hh*cos|`이며 `min = center - (ex, ey)`,
 * `max = center + (ex, ey)`다. `size.x <= 0 || size.y <= 0`인 empty oriented rect는 sentinel empty
 * bounds(`min = (Infinity, Infinity)`, `max = (-Infinity, -Infinity)`)를 기록한다. size 두 성분이나
 * angle이 non-finite이면 `RangeError`다. center 좌표 non-finite는 검증하지 않고 산술 결과를 따른다.
 * source 값을 먼저 모두 읽으므로 input과 out이 같은 object여도 안전하다.
 *
 * @param out bounds를 기록할 writable output
 * @param rect bounds로 변환할 oriented rect
 */
export function boundsInto<Out extends BoundsWritable<XYWritable, XYWritable>>(out: Out, rect: OrientedRectLike): Out {
  // aliasing 안전 - 모든 입력 값을 먼저 읽은 후 기록한다
  const center = readOrientedRectCenter(rect);
  const cx = readX(center);
  const cy = readY(center);
  const size = readOrientedRectSize(rect);
  const width = readX(size);
  const height = readY(size);
  const angle = readOrientedRectAngle(rect);
  validateOrientedRectSizeAndAngle(width, height, angle);

  if (width <= 0 || height <= 0) {
    // empty oriented rect는 sentinel empty bounds를 기록한다
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
    return out;
  }

  const hw = width / 2;
  const hh = height / 2;
  const ex = Math.abs(hw * Math.cos(angle)) + Math.abs(hh * Math.sin(angle));
  const ey = Math.abs(hw * Math.sin(angle)) + Math.abs(hh * Math.cos(angle));

  writeXY(out.min, cx - ex, cy - ey);
  writeXY(out.max, cx + ex, cy + ey);
  return out;
}
