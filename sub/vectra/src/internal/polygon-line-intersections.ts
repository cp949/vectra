/**
 * line-family (segment, ray, infinite-line) × polygon 교점 collection 계산용 internal kernel.
 *
 * polygon의 모든 edge를 segment로 순회해 line-family와의 교점을 수집한다.
 * boolean relation(`lineFamilyPolygonIntersects`)과 달리 교점 위치/edge metadata를 보존한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

export type { LinePolygonHitRecord } from './polygon-line-hits.internal';
export {
  closestLineFamilyPolygonIntersectionInto,
  lineFamilyPolygonIntersectionHits,
  lineFamilyPolygonIntersectionHitsInto,
  recordToHit,
} from './polygon-line-hits.internal';

import type { LinePolygonOverlapIntervalDetail, PolygonLike, XYObjectWritable } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { getLineFamilyOwnRangeInterval } from './line-family-range.internal';
import { readPolygonPoints } from './polygon';
import { readX, readY } from './xy';

/**
 * line-family × polygon collinear overlap 구간 1건의 raw record.
 *
 * public `LinePolygonOverlapIntervalDetail`로 매핑하기 전 단계의 평면 record다.
 * `tLineStart <= tLineEnd`이고 `tEdgeStart`/`tEdgeEnd`는 각 끝점의 edge-local parameter `[0, 1]`다.
 */
export interface LinePolygonOverlapIntervalRecord {
  /** 구간 시작점 x */
  startX: number;

  /** 구간 시작점 y */
  startY: number;

  /** 구간 끝점 x */
  endX: number;

  /** 구간 끝점 y */
  endY: number;

  /** 구간 시작 line-family parameter */
  tLineStart: number;

  /** 구간 끝 line-family parameter */
  tLineEnd: number;

  /** 시작점 edge-local parameter `[0, 1]` */
  tEdgeStart: number;

  /** 끝점 edge-local parameter `[0, 1]` */
  tEdgeEnd: number;

  /** polygon edge index */
  edgeIndex: number;
}

/**
 * line-family와 collinear로 겹치는 polygon edge의 overlap 구간을 outIntervals에 기록하고 같은 배열을 반환한다.
 *
 * outIntervals는 먼저 clear되고 양의 길이를 가진 collinear overlap 구간만 push된다. 반환 순서는
 * line-family parameter `tLineStart` 오름차순이다.
 *
 * | 케이스                          | 결과                                          |
 * |--------------------------------|-----------------------------------------------|
 * | collinear edge overlap(양의 길이) | interval 1건 (`tLineStart <= tLineEnd`)       |
 * | transversal crossing            | interval 없음                                 |
 * | vertex touch / containment-only | interval 없음                                 |
 * | 한 점으로 수렴(좌표계 길이 `<= epsilon`) | interval 없음                           |
 * | empty polygon(`n < 3`)          | 빈 배열                                       |
 * | degenerate direction(`|d| = 0`) | 빈 배열                                       |
 * | non-finite vertex/direction/origin | 해당 edge skip(가짜 interval 미생성)        |
 *
 * 각 interval은 line-family own range로 clipping된다(segment `[0, 1]`, ray `[0, ∞)`, infinite-line 전체).
 * `epsilon`은 collinear 판정과 한 점 수렴 판정에 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outIntervals overlap 구간 record를 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function lineFamilyPolygonOverlapIntervals(
  outIntervals: LinePolygonOverlapIntervalRecord[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonOverlapIntervalRecord[] {
  outIntervals.length = 0;

  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return outIntervals;

  const lenSq = dx * dx + dy * dy;
  // degenerate direction: interval collection은 항상 빈 배열
  if (lenSq === 0 && dx === 0 && dy === 0) return outIntervals;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    const ex = bx - ax;
    const ey = by - ay;
    const cross = dx * ey - dy * ex;
    // non-finite vertex/direction: 가짜 interval을 만들지 않고 edge를 건너뛴다(pass-through).
    if (!Number.isFinite(cross)) continue;
    // non-parallel edge는 collinear overlap이 없다.
    if (Math.abs(cross) > epsilon) continue;
    const qx = ax - ox;
    const qy = ay - oy;
    // non-finite origin: q vector가 non-finite면 fabricated interval을 만들지 않고 건너뛴다.
    if (!Number.isFinite(qx) || !Number.isFinite(qy)) continue;

    // parallel: collinear 여부 확인 (edge 시작점 a의 line까지 거리)
    const tStart = lineParamOnDominantAxis(ax, ay, ox, oy, dx, dy);
    const sx = ox + tStart * dx - ax;
    const sy = oy + tStart * dy - ay;
    if (sx * sx + sy * sy > epsilon * epsilon) continue;

    // collinear overlap: edge 두 끝점을 line parameter로 투영 후 range로 clipping
    const tEnd = lineParamOnDominantAxis(bx, by, ox, oy, dx, dy);
    const loEdgeT = Math.min(tStart, tEnd);
    const hiEdgeT = Math.max(tStart, tEnd);
    const range = getLineFamilyOwnRangeInterval(kind);
    const lo = Math.max(loEdgeT, range.lo);
    const hi = Math.min(hiEdgeT, range.hi);
    if (lo > hi) continue;
    const startX = ox + lo * dx;
    const startY = oy + lo * dy;
    const endX = ox + hi * dx;
    const endY = oy + hi * dy;
    // 빈 구간 또는 한 점 수렴은 interval이 아니다. 길이는 line parameter가 아니라 좌표계 거리 기준이다.
    if (Math.hypot(endX - startX, endY - startY) <= epsilon) continue;
    outIntervals.push({
      startX,
      startY,
      endX,
      endY,
      tLineStart: lo,
      tLineEnd: hi,
      tEdgeStart: edgeParam(startX, startY, ax, ay, ex, ey),
      tEdgeEnd: edgeParam(endX, endY, ax, ay, ex, ey),
      edgeIndex: i,
    });
  }

  outIntervals.sort((p, q) => p.tLineStart - q.tLineStart);
  return outIntervals;
}

/**
 * line-family × polygon collinear overlap 구간을 public `LinePolygonOverlapIntervalDetail`로 outIntervals에
 * 기록하고 같은 outIntervals를 반환한다.
 *
 * record kernel(`lineFamilyPolygonOverlapIntervals`)의 결과를 public interval shape로 매핑한다.
 * outIntervals는 먼저 clear되고 새 interval object가 push된다. push되는 interval과 nested
 * `start`/`end` point는 매 호출 새 object이며 입력 point object를 재사용하지 않는다.
 *
 * @param outIntervals overlap 구간을 기록할 output array (호출 전 내용은 비워진다)
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 교차를 구할 polygon
 * @param epsilon collinear/수렴 판정 임계값
 */
export function lineFamilyPolygonOverlapIntervalsInto(
  outIntervals: LinePolygonOverlapIntervalDetail[],
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number
): LinePolygonOverlapIntervalDetail[] {
  const records: LinePolygonOverlapIntervalRecord[] = [];
  lineFamilyPolygonOverlapIntervals(records, ox, oy, dx, dy, kind, polygon, epsilon);
  outIntervals.length = 0;
  for (let i = 0; i < records.length; i++) {
    outIntervals.push(recordToInterval(records[i]));
  }
  return outIntervals;
}

/** raw interval record를 public `LinePolygonOverlapIntervalDetail` object로 변환한다. nested point는 새 `{ x, y }`다. */
export function recordToInterval(
  record: LinePolygonOverlapIntervalRecord
): LinePolygonOverlapIntervalDetail<XYObjectWritable> {
  return {
    kind: 'overlap',
    start: { x: record.startX, y: record.startY },
    end: { x: record.endX, y: record.endY },
    tLineStart: record.tLineStart,
    tLineEnd: record.tLineEnd,
    tEdgeStart: record.tEdgeStart,
    tEdgeEnd: record.tEdgeEnd,
    edgeIndex: record.edgeIndex,
  };
}

/** 점 `(px, py)`를 edge `a + t·e` 위 edge-local parameter `[0, 1]`로 투영한다. edge 길이 0이면 0. */
function edgeParam(px: number, py: number, ax: number, ay: number, ex: number, ey: number): number {
  if (ex === 0 && ey === 0) return 0;
  const t = Math.abs(ex) >= Math.abs(ey) ? (px - ax) / ex : (py - ay) / ey;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** line 위 점을 overflow-resistant dominant axis로 line-family parameter에 투영한다. */
function lineParamOnDominantAxis(px: number, py: number, ox: number, oy: number, dx: number, dy: number): number {
  return Math.abs(dx) >= Math.abs(dy) ? (px - ox) / dx : (py - oy) / dy;
}
