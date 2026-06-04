import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * other rect를 포함하도록 rect의 raw extent를 확장해 out에 기록한다.
 *
 * empty rect 분기를 따로 처리하지 않고 두 rect의 x/y/right/bottom 자연식을 그대로 사용한다.
 * negative width/height 입력도 corner 정규화 없이 계산한다.
 * out과 입력 rect가 같은 object여도 안전하다.
 *
 * @param out 확장된 rect를 기록할 writable output
 * @param rect 확장의 기준이 되는 rect
 * @param other 포함시킬 rect
 */
export function expandToIncludeRectInto<Out extends RectWritable>(out: Out, rect: RectLike, other: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const rRight = rx + readRectWidth(rect);
  const rBottom = ry + readRectHeight(rect);
  const ox = readRectX(other);
  const oy = readRectY(other);
  const oRight = ox + readRectWidth(other);
  const oBottom = oy + readRectHeight(other);

  const newX = rx < ox ? rx : ox;
  const newY = ry < oy ? ry : oy;
  const newRight = rRight > oRight ? rRight : oRight;
  const newBottom = rBottom > oBottom ? rBottom : oBottom;

  out.x = newX;
  out.y = newY;
  out.width = newRight - newX;
  out.height = newBottom - newY;
  return out;
}
