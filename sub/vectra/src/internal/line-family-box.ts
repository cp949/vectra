/**
 * line-family (segment, ray, infinite-line) × axis-aligned box(rect/bounds) 교점 collection 계산용
 * internal helper.
 *
 * box boundary를 4개 edge segment를 가진 polygon으로 보고 line-family × polygon record kernel을
 * 재사용한다. edge/corner dedupe, collinear overlap start/end, `tLine` 오름차순 정렬을 그대로 따른다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { XYInput, XYObjectWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { type LinePolygonHitRecord, lineFamilyPolygonIntersectionHits } from './polygon-line-intersections';

/**
 * line-family와 axis-aligned box boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를
 * 반환한다.
 *
 * 호출자가 box가 비어 있지 않음을 보장한다(`x0 ≤ x1`, `y0 ≤ y1`). empty box는 호출 전에 거르고 빈
 * collection을 반환해야 한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object다.
 * 반환 순서는 line-family parameter `tLine` 오름차순이며, 같은 점을 두 edge가 보고하는 corner hit은
 * 하나로 dedupe된다. box 내부에 완전히 포함되고 boundary 교점이 없는 line-family는 빈 collection이다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param x0 box min corner x
 * @param y0 box min corner y
 * @param x1 box max corner x
 * @param y1 box max corner y
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function lineFamilyBoxIntersectionPoints(
  outPoints: XYObjectWritable[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  epsilon: number
): XYObjectWritable[] {
  outPoints.length = 0;

  // box boundary를 CCW polygon edge로 순회한다.
  const corners: readonly XYInput[] = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
  const records: LinePolygonHitRecord[] = [];
  lineFamilyPolygonIntersectionHits(records, ox, oy, dx, dy, kind, corners, epsilon);
  for (let i = 0; i < records.length; i++) {
    outPoints.push({ x: records[i].x, y: records[i].y });
  }
  return outPoints;
}
