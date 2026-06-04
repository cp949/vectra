/**
 * triangle × line-family (segment, ray, infinite-line) 교점 collection 계산용 internal kernel.
 *
 * triangle을 3-vertex polygon으로 보고 `lineFamilyPolygonIntersectionHits`를 재사용한다. edge/corner
 * dedupe, collinear overlap start/end, line-family parameter `t` 오름차순 정렬은 polygon kernel이
 * 그대로 담당한다. triangle 고유의 degenerate/non-finite 정책만 여기서 추가한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { LineFamilyRangeKind } from '../internal/line-family-param.internal';
import { type LinePolygonHitRecord, lineFamilyPolygonIntersectionHits } from '../internal/polygon-line-intersections';
import type { XYInput, XYObjectWritable } from '../types';

/**
 * line-family와 triangle boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle vertex는 (ax, ay), (bx, by), (cx, cy)로 받고 edge는 A-B, B-C, C-A 순서로 순회한다.
 * 최종 결과는 line-family parameter `t` 오름차순이며 같은 점을 두 edge가 보고하는 vertex hit은 하나로
 * dedupe된다. boundary 교점만 노출하므로 line-family가 triangle 내부에 완전히 포함되거나 지나가지만
 * boundary 교점이 없으면 빈 collection이다.
 * - transversal crossing 1점, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex는 segment/point로 환원하지 않고 빈
 *   collection이다.
 * - zero-length/zero-vector line-family(`dx === 0 && dy === 0`), non-finite line coordinate도 빈 collection이다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 vertex/point object를 재사용하지 않는다. `epsilon`은 collinear/dedupe 판정에만 쓰고 range
 * 판정은 line-family parameter의 정확 비교를 따른다. finite validation threshold로는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param ax triangle vertex a x
 * @param ay triangle vertex a y
 * @param bx triangle vertex b x
 * @param by triangle vertex b y
 * @param cx triangle vertex c x
 * @param cy triangle vertex c y
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleLineFamilyIntersectionsInto(
  outPoints: XYObjectWritable[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  epsilon: number
): XYObjectWritable[] {
  outPoints.length = 0;

  // non-finite vertex: segment/point로 환원하지 않고 빈 collection.
  if (
    !Number.isFinite(ax) ||
    !Number.isFinite(ay) ||
    !Number.isFinite(bx) ||
    !Number.isFinite(by) ||
    !Number.isFinite(cx) ||
    !Number.isFinite(cy)
  ) {
    return outPoints;
  }
  // degenerate triangle(signed area 2× === 0): 빈 collection.
  if ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax) === 0) return outPoints;

  const corners: readonly XYInput[] = [
    { x: ax, y: ay },
    { x: bx, y: by },
    { x: cx, y: cy },
  ];
  const records: LinePolygonHitRecord[] = [];
  lineFamilyPolygonIntersectionHits(records, ox, oy, dx, dy, kind, corners, epsilon);
  for (let i = 0; i < records.length; i++) {
    outPoints.push({ x: records[i].x, y: records[i].y });
  }
  return outPoints;
}
