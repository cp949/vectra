import type { Rect, TriangleWritable } from '../types/flat-shapes.internal';

/**
 * rect의 세 corner를 직각삼각형 vertex로 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - (x1, y1) = (x, y) (top-left)
 * - (x2, y2) = (x + width, y) (top-right)
 * - (x3, y3) = (x, y + height) (bottom-left)
 *
 * `width > 0 && height > 0`이면 a에서 직각인 직각삼각형이 된다. `width = 0` 또는
 * `height = 0`은 degenerate triangle을 기록한다. 음수 width / height는 clamp하지 않고
 * JS 산술 결과(뒤집힌 삼각형)를 따른다.
 *
 * NaN/Infinity component는 validation 없이 JS 산술 결과를 그대로 기록한다.
 *
 * 입력 좌표를 먼저 읽은 뒤 결과를 기록한다.
 *
 * @param out 직각삼각형 vertex를 기록할 삼각형 객체
 * @param rect 세 corner를 읽을 사각형 객체
 */
export function fromRectInto<Out extends TriangleWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전을 위해 rect component를 모두 local에 먼저 읽는다
  const { x, y, width, height } = rect;

  out.x1 = x;
  out.y1 = y;
  out.x2 = x + width;
  out.y2 = y;
  out.x3 = x;
  out.y3 = y + height;

  return out;
}
