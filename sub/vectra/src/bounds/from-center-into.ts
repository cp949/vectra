import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, XYInput } from '../types';

/**
 * center와 size로 정의하는 bounds를 out에 기록한다.
 *
 * min = center - size / 2, max = center + size / 2.
 * size.x/size.y를 width/height로 해석한다. 음수 size는 정규화하지 않는다.
 * 결과가 inverted이면 empty bounds가 된다.
 *
 * out이 center 또는 size와 alias되어도 안전하다.
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param out bounds를 기록할 writable output
 * @param center bounds 중심 좌표
 * @param size bounds의 width/height를 담은 XYInput (x=width, y=height)
 */
export function fromCenterInto<Out extends BoundsWritable>(out: Out, center: XYInput, size: XYInput): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = readX(center);
  const cy = readY(center);
  const hw = readX(size) / 2;
  const hh = readY(size) / 2;
  writeXY(out.min, cx - hw, cy - hh);
  writeXY(out.max, cx + hw, cy + hh);
  return out;
}
