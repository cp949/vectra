import { readX, readY } from '../internal/xy';
import type { MatrixWritable, XYInput } from '../types';

/**
 * point를 중심으로 scale하는 matrix를 out에 기록하고 out을 반환한다.
 *
 * `T(point) * S(scale) * T(-point)`를 직접 전개해 기록한다.
 * `scale`이 `number`이면 uniform scale (sx = sy = scale),
 * `XYInput`이면 non-uniform scale (sx = scale.x, sy = scale.y).
 *
 * 결과: `a=sx, b=0, c=0, d=sy, tx=px*(1-sx), ty=py*(1-sy)`.
 *
 * @param out transform matrix를 기록할 writable output
 * @param point scale 중심점
 * @param scale uniform(`number`) 또는 non-uniform(`XYInput`) scale
 */
export function scaleAroundPointInto<Out extends MatrixWritable>(
  out: Out,
  point: XYInput,
  scale: number | XYInput
): Out {
  const px = readX(point);
  const py = readY(point);
  let sx: number;
  let sy: number;
  if (typeof scale === 'number') {
    sx = scale;
    sy = scale;
  } else {
    sx = readX(scale);
    sy = readY(scale);
  }

  out.a = sx;
  out.b = 0;
  out.c = 0;
  out.d = sy;
  out.tx = px * (1 - sx);
  out.ty = py * (1 - sy);
  return out;
}
