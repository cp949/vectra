import type { Bounds, BoundsWritable, Point } from '../types/flat-shapes.internal';

/**
 * bounds와 point를 모두 포함하는 bounds를 out에 기록한다.
 *
 * min/max의 raw 자연식을 적용하며 inverted bounds를 별도로 정규화하지 않는다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param bounds 확장할 기준 bounds
 * @param point 포함시킬 point
 */
export function expandToIncludePointInto<Out extends BoundsWritable>(out: Out, bounds: Bounds, point: Point): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const bMinX = bounds.minX;
  const bMinY = bounds.minY;
  const bMaxX = bounds.maxX;
  const bMaxY = bounds.maxY;
  const px = point.x;
  const py = point.y;
  const newMinX = bMinX < px ? bMinX : px;
  const newMinY = bMinY < py ? bMinY : py;
  const newMaxX = bMaxX > px ? bMaxX : px;
  const newMaxY = bMaxY > py ? bMaxY : py;
  out.minX = newMinX;
  out.minY = newMinY;
  out.maxX = newMaxX;
  out.maxY = newMaxY;
  return out;
}
