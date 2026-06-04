import { readX, readY, writeXY } from '../internal/xy';
import type { TriangleWritable, XYInput, XYWritable } from '../types';

/**
 * origin, width, height로 정의되는 직각삼각형 vertex를 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - dir = (cos(angle), sin(angle))
 * - left = (-sin(angle), cos(angle))
 * - out.a = origin
 * - out.b = origin + width * dir
 * - out.c = origin + height * left
 *
 * `width > 0 && height > 0`이면 기본 CCW 직각삼각형이 된다. `width = 0` 또는 `height = 0`은
 * degenerate triangle을 기록한다. 음수 width / height는 clamp하지 않고 JS 산술 결과를 따른다.
 *
 * NaN/Infinity 입력은 validation 없이 JS 산술 결과(NaN 또는 Infinity)를 그대로 기록한다.
 * 특히 angle이 Infinity면 `Math.cos`/`Math.sin` 결과가 NaN이라 b/c가 NaN으로 흐른다.
 *
 * aliasing: origin은 좌표를 local에 먼저 읽으므로 out의 vertex storage와 같아도 안전하다.
 *
 * @param out 직각삼각형 vertex를 기록할 writable output
 * @param origin 직각이 되는 첫 vertex
 * @param width origin→b의 길이. clamp하지 않는다.
 * @param height origin→c의 길이. clamp하지 않는다.
 * @param angle origin→b 방향의 radian. 기본값 0.
 */
export function buildRightInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  origin: XYInput,
  width: number,
  height: number,
  angle: number = 0
): Out {
  // aliasing 안전을 위해 origin 좌표를 local에 먼저 읽는다
  const ox = readX(origin);
  const oy = readY(origin);

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  // left normal = (-sinA, cosA)
  writeXY(out.a, ox, oy);
  writeXY(out.b, ox + width * cosA, oy + width * sinA);
  writeXY(out.c, ox + height * -sinA, oy + height * cosA);

  return out;
}
