/**
 * line-family (segment, ray, infinite-line) × polygon edge 순회용 공유 kernel.
 *
 * hit 수집(`polygon-line-hits.internal`)과 collinear overlap 구간 수집
 * (`polygon-line-overlap-intervals.internal`)이 각각 다시 구현하던 정점 순회 · cross product ·
 * finite guard · collinear 판정을 이 모듈 하나로 모은다. 두 모듈은 이 kernel에 recorder를 넘겨
 * 결과를 기록만 한다.
 *
 * kernel은 non-parallel edge에서 tLine/tEdge 판정을 하지 않는다 — 그 판정은 hit 수집에서만
 * 쓰이고 overlap 구간 수집은 non-parallel edge를 아예 무시하므로, kernel에 두면 overlap 구간
 * 수집 쪽에 불필요한 나눗셈이 추가된다. kernel은 raw cross/qx/qy만 recorder에 넘기고 판정은
 * recorder(hit 쪽)에 맡긴다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { PolygonLike } from '../types';
import type { LineFamilyRangeKind } from './line-family-param.internal';
import { getLineFamilyOwnRangeInterval } from './line-family-range.internal';
import { readPolygonPoints } from './polygon';
import { readX, readY } from './xy';

/**
 * `scanLineFamilyPolygonEdges`가 edge 판정 결과를 기록하도록 넘기는 recorder.
 *
 * kernel은 최종 hit/interval object를 만들지 않는다 — local parameter와 classification만
 * 넘기고, 그 결과를 어떻게 기록할지는 recorder(hit 수집 vs overlap 구간 수집)가 결정한다.
 * 각 콜백의 `return`은 현재 edge의 기록만 끝내며, kernel의 전체 edge 순회를 중단하지 않는다.
 */
export interface LineFamilyPolygonEdgeScanRecorder {
  /**
   * non-parallel edge(`|cross| > epsilon`)마다 호출된다.
   *
   * kernel은 tLine/tEdge를 계산하지 않는다 — 이 판정이 필요한 recorder(hit 수집)가 ex, ey,
   * qx, qy, cross로부터 직접 계산한다. overlap 구간 수집처럼 non-parallel edge에 관심 없는
   * recorder는 이 메서드를 no-op으로 둔다.
   *
   * @param edgeIndex polygon edge index
   * @param ex edge 방향 x (`b.x - a.x`)
   * @param ey edge 방향 y (`b.y - a.y`)
   * @param qx edge 시작점 - line-family origin, x (`a.x - ox`)
   * @param qy edge 시작점 - line-family origin, y (`a.y - oy`)
   * @param cross line-family direction × edge direction cross product
   */
  crossing(edgeIndex: number, ex: number, ey: number, qx: number, qy: number, cross: number): void;

  /**
   * line-family와 collinear한 edge의 range 겹침이 비어 있지 않을 때(`lo <= hi`) 호출된다.
   *
   * `lo`/`hi`는 이미 range로 clipping된 line-family parameter다. `lo === hi`인 zero-length
   * 겹침을 기록에서 제외할지는 recorder가 결정한다.
   *
   * @param edgeIndex polygon edge index
   * @param ax edge 시작점 x
   * @param ay edge 시작점 y
   * @param ex edge 방향 x (`b.x - a.x`)
   * @param ey edge 방향 y (`b.y - a.y`)
   * @param lo 겹침 구간의 낮은 line-family parameter
   * @param hi 겹침 구간의 높은 line-family parameter
   */
  collinear(edgeIndex: number, ax: number, ay: number, ex: number, ey: number, lo: number, hi: number): void;
}

/**
 * line-family × polygon의 모든 edge를 순회하며 recorder에 판정 결과를 기록시킨다.
 *
 * | 케이스                                  | 결과                              |
 * |------------------------------------------|-----------------------------------|
 * | non-parallel edge(`|cross| > epsilon`)    | `recorder.crossing(...)` 호출     |
 * | collinear edge, 비어 있지 않은 겹침(`lo <= hi`) | `recorder.collinear(...)` 호출 |
 * | collinear이지만 겹침 없음(`lo > hi`)      | 호출 없음                          |
 * | non-finite vertex/direction/origin        | 해당 edge skip(호출 없음)          |
 * | empty polygon(`n < 3`)                    | 호출 없음                          |
 * | degenerate direction(`|d| = 0`)           | 호출 없음                          |
 *
 * @param ox line-family origin x
 * @param oy line-family origin y
 * @param dx line-family direction x
 * @param dy line-family direction y
 * @param kind range kind
 * @param polygon 순회할 polygon
 * @param epsilon parallel/collinear 판정 임계값
 * @param recorder edge 판정 결과를 기록할 recorder
 */
export function scanLineFamilyPolygonEdges(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  kind: LineFamilyRangeKind,
  polygon: PolygonLike,
  epsilon: number,
  recorder: LineFamilyPolygonEdgeScanRecorder
): void {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return;

  const lenSq = dx * dx + dy * dy;
  // degenerate direction: 판정 대상 자체가 없다
  if (lenSq === 0 && dx === 0 && dy === 0) return;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    const ex = bx - ax;
    const ey = by - ay;
    const cross = dx * ey - dy * ex;
    // non-finite vertex/direction: 가짜 판정을 만들지 않고 해당 edge를 건너뛴다(pass-through).
    if (!Number.isFinite(cross)) continue;

    if (Math.abs(cross) > epsilon) {
      const qx = ax - ox;
      const qy = ay - oy;
      // cross는 origin 독립이므로 q vector를 별도로 검증한다.
      if (!Number.isFinite(qx) || !Number.isFinite(qy)) continue;
      recorder.crossing(i, ex, ey, qx, qy, cross);
      continue;
    }

    const qx = ax - ox;
    const qy = ay - oy;
    // parallel edge도 non-finite origin에서 가짜 collinear 판정을 만들지 않는다.
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

    recorder.collinear(i, ax, ay, ex, ey, lo, hi);
  }
}

/** 점 `(px, py)`를 edge `a + t·e` 위 edge-local parameter `[0, 1]`로 투영한다. edge 길이 0이면 0. */
export function edgeParam(px: number, py: number, ax: number, ay: number, ex: number, ey: number): number {
  if (ex === 0 && ey === 0) return 0;
  const t = Math.abs(ex) >= Math.abs(ey) ? (px - ax) / ex : (py - ay) / ey;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** line 위 점을 overflow-resistant dominant axis로 line-family parameter에 투영한다. */
function lineParamOnDominantAxis(px: number, py: number, ox: number, oy: number, dx: number, dy: number): number {
  return Math.abs(dx) >= Math.abs(dy) ? (px - ox) / dx : (py - oy) / dy;
}
