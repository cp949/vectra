import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, TriangleWritable, XYWritable } from '../types';

/**
 * rect의 세 corner를 직각삼각형 vertex로 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - out.a = (x, y) (top-left)
 * - out.b = (x + width, y) (top-right)
 * - out.c = (x, y + height) (bottom-left)
 *
 * `width > 0 && height > 0`이면 a에서 직각인 직각삼각형이 된다. `width = 0` 또는
 * `height = 0`은 degenerate triangle을 기록한다. 음수 width / height는 clamp하지 않고
 * JS 산술 결과(뒤집힌 삼각형)를 따른다.
 *
 * NaN/Infinity component는 validation 없이 JS 산술 결과를 그대로 기록한다.
 *
 * aliasing: rect component를 모두 local에 먼저 읽으므로 rect가 out의 vertex storage와
 * 같은 object여도 안전하다.
 *
 * @param out 직각삼각형 vertex를 기록할 writable output
 * @param rect 세 corner를 읽을 rect input. object 또는 tuple을 받는다.
 */
export function fromRectInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  rect: RectLike
): Out {
  // aliasing 안전을 위해 rect component를 모두 local에 먼저 읽는다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);

  writeXY(out.a, x, y);
  writeXY(out.b, x + width, y);
  writeXY(out.c, x, y + height);

  return out;
}
