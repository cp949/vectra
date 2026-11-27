import type { Polygon, PointWritable } from '../types/flat-shapes.internal';

/**
 * polygon의 index번째 vertex를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * valid index: 정수이고 0 <= index < 해석된 point list 길이.
 * invalid index(음수, 범위 초과, NaN, ±Infinity, 비정수 finite number): false 반환, out 미수정.
 *
 * @param out vertex를 기록할 writable output (`x, y`)
 * @param polygon vertex를 읽을 polygon
 * @param index 읽을 vertex index
 */
export function pointAtIndexInto(out: PointWritable, polygon: Polygon, index: number): boolean {
  const n = polygon.length / 2;
  if (!(Number.isInteger(index) && index >= 0 && index < n)) return false;
  const x = polygon[2 * index];
  const y = polygon[2 * index + 1];
  out.x = x;
  out.y = y;
  return true;
}
