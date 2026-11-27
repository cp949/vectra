import type { EllipseWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect에서 ellipse를 생성해 out에 기록하고 out을 반환한다.
 *
 * center = (x + width/2, y + height/2), rx = width/2, ry = height/2.
 * width <= 0이면 rx = 0, height <= 0이면 ry = 0 (독립 적용).
 * center는 width/height 부호와 무관하게 항상 기록한다.
 *
 * @param out ellipse를 기록할 객체
 * @param rect ellipse를 생성할 rect
 */
export function fromRectInto<Out extends EllipseWritable>(out: Out, rect: Rect): Out {
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;

  out.cx = x + w * 0.5;
  out.cy = y + h * 0.5;
  out.rx = w <= 0 ? 0 : w * 0.5;
  out.ry = h <= 0 ? 0 : h * 0.5;
  return out;
}
