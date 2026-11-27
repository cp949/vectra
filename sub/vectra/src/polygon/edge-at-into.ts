import type { Polygon, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * polygon의 index번째 닫힌 edge를 out에 기록하고 성공 여부를 반환한다.
 *
 * boolean primary Into 예외 함수: 성공 시 true, 실패 시 false와 out 미수정.
 * valid index: 정수이고 0 <= index < edgeCount(polygon).
 * invalid index(음수, 범위 초과, NaN, ±Infinity, 비정수 finite number): false 반환, out 미수정.
 * 마지막 edge(index === pointCount - 1)는 마지막 point → 첫 point segment다.
 *
 * @param out edge를 기록할 writable output (`x1, y1, x2, y2`)
 * @param polygon edge를 읽을 polygon
 * @param index 읽을 edge index
 */
export function edgeAtInto(out: SegmentWritable, polygon: Polygon, index: number): boolean {
  const n = polygon.length / 2;
  if (n < 2) return false;
  if (!(Number.isInteger(index) && index >= 0 && index < n)) return false;
  // alias-safe: a/b 좌표를 먼저 읽은 뒤 out에 기록한다
  const j = (index + 1) % n;
  const ax = polygon[2 * index];
  const ay = polygon[2 * index + 1];
  const bx = polygon[2 * j];
  const by = polygon[2 * j + 1];
  out.x1 = ax;
  out.y1 = ay;
  out.x2 = bx;
  out.y2 = by;
  return true;
}
