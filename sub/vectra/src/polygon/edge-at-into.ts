import { readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolygonLike, SegmentWritable, XYWritable } from '../types';

/**
 * polygon의 index번째 닫힌 edge를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * valid index: 정수이고 0 <= index < edgeCount(polygon).
 * invalid index(음수, 범위 초과, NaN, ±Infinity, 비정수 finite number): false 반환, out 미수정.
 * 마지막 edge(index === pointCount - 1)는 마지막 point → 첫 point segment다.
 * out endpoint가 polygon point와 alias되어도 안전하다.
 *
 * @param out edge를 기록할 writable output
 * @param polygon edge를 읽을 polygon
 * @param index 읽을 edge index
 */
export function edgeAtInto(out: SegmentWritable<XYWritable, XYWritable>, polygon: PolygonLike, index: number): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 2) return false;
  if (!(Number.isInteger(index) && index >= 0 && index < n)) return false;
  // alias-safe: a/b 좌표를 먼저 읽은 뒤 out에 기록한다
  const j = (index + 1) % n;
  const ax = readX(pts[index]);
  const ay = readY(pts[index]);
  const bx = readX(pts[j]);
  const by = readY(pts[j]);
  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  return true;
}
