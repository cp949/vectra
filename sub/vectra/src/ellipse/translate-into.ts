import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { readX, readY, writeXY } from '../internal/xy';
import type { EllipseLike, EllipseWritable, XYInput, XYWritable } from '../types';

/**
 * ellipse의 center를 offset만큼 평행 이동한 결과를 out에 기록하고 out을 반환한다.
 *
 * radii는 그대로 복사한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 이동된 ellipse를 기록할 writable output
 * @param ellipse 이동할 ellipse
 * @param offset center에 더할 이동 벡터
 */
export function translateInto<Out extends EllipseWritable<XYWritable>>(
  out: Out,
  ellipse: EllipseLike,
  offset: XYInput
): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = readX(readEllipseCenter(ellipse));
  const cy = readY(readEllipseCenter(ellipse));
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  const ox = readX(offset);
  const oy = readY(offset);
  writeXY(out.center, cx + ox, cy + oy);
  out.radiusX = rx;
  out.radiusY = ry;
  return out;
}
