import { readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolygonLike, XYWritable } from '../types';

/**
 * polygon의 index번째 vertex를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * valid index: 정수이고 0 <= index < 해석된 point list 길이.
 * invalid index(음수, 범위 초과, NaN, ±Infinity, 비정수 finite number): false 반환, out 미수정.
 *
 * @param out vertex를 기록할 writable output
 * @param polygon vertex를 읽을 polygon
 * @param index 읽을 vertex index
 */
export function pointAtIndexInto(out: XYWritable, polygon: PolygonLike, index: number): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (!(Number.isInteger(index) && index >= 0 && index < n)) return false;
  const pt = pts[index];
  writeXY(out, readX(pt), readY(pt));
  return true;
}
