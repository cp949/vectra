import type { Rect, RectWritable, Point } from '../types/flat-shapes.internal';

/**
 * point를 포함하도록 rect의 raw extent를 확장해 out에 기록한다.
 *
 * empty rect 분기를 따로 처리하지 않고 `min(x, point.x)`/`max(right, point.x)` 산식을 사용한다.
 * out과 rect 또는 point가 같은 storage를 공유해도 안전하다.
 *
 * @param out 확장된 rect를 기록할 사각형 객체
 * @param rect 확장의 기준이 되는 rect
 * @param point 포함시킬 point
 */
export function expandToIncludePointInto<Out extends RectWritable>(out: Out, rect: Rect, point: Point): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const rx = rect.x;
  const ry = rect.y;
  const rRight = rx + rect.width;
  const rBottom = ry + rect.height;
  const px = point.x;
  const py = point.y;

  const newX = rx < px ? rx : px;
  const newY = ry < py ? ry : py;
  const newRight = rRight > px ? rRight : px;
  const newBottom = rBottom > py ? rBottom : py;

  out.x = newX;
  out.y = newY;
  out.width = newRight - newX;
  out.height = newBottom - newY;
  return out;
}
