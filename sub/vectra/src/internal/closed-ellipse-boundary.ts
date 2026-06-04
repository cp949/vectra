/**
 * closed primitive(circle/ellipse) × box/triangle boundary 교점 collection 계산용 internal helper.
 *
 * rect/bounds/triangle boundary를 segment edge 목록으로 받아 각 edge × ellipse 교점을 모으고,
 * corner/vertex/tangent 중복을 dedupe한 뒤 ellipse(첫 번째 입력) 기준 normalized turn 오름차순으로
 * 정렬한다. circle은 radiusX=radiusY인 ellipse로 환원해 같은 helper를 쓴다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { XYObjectWritable } from '../types';
import { lineFamilyEllipseIntersectionPoints } from './line-family-ellipse';

/** boundary edge 한 변의 양 끝점 좌표. */
export interface BoundaryEdge {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * ellipse(또는 circle) boundary와 box/triangle edge 목록의 교점을 outPoints에 기록하고 같은 outPoints를
 * 반환한다.
 *
 * 각 edge를 segment(`finite` range)로 보고 ellipse circumference 교점을 모은다. boundary 교점만 점으로
 * 노출하므로, ellipse가 다각형을 완전히 포함하거나 다각형이 ellipse를 완전히 포함해 boundary 교점이 없으면
 * 빈 collection이다. corner/vertex에서 두 edge가 같은 점을 보고하거나 tangent가 한 점에 수렴하면 epsilon
 * 거리로 dedupe한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object다.
 * 반환 순서는 ellipse center 기준 normalized turn(`[0, 1)`) 오름차순이다.
 * empty ellipse(rx ≤ 0 또는 ry ≤ 0)는 빈 collection이다. `epsilon`은 tangent/dedupe 판정에만 쓰고
 * finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param edges boundary edge 목록 (각 edge는 segment 양 끝점)
 * @param cx ellipse center x
 * @param cy ellipse center y
 * @param rx ellipse x반지름 (circle은 radius)
 * @param ry ellipse y반지름 (circle은 radius)
 * @param epsilon tangent/dedupe 판정 임계값
 */
export function closedEllipseBoundaryIntersectionPoints(
  outPoints: XYObjectWritable[],
  edges: readonly BoundaryEdge[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): XYObjectWritable[] {
  outPoints.length = 0;
  if (rx <= 0 || ry <= 0) return outPoints;

  const epsSq = epsilon * epsilon;
  const scratch: XYObjectWritable[] = [];
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (e.x0 === e.x1 && e.y0 === e.y1) {
      if (
        isPointOnEllipseBoundary(e.x0, e.y0, cx, cy, rx, ry, epsilon) &&
        !hasNearbyPoint(outPoints, e.x0, e.y0, epsSq)
      ) {
        outPoints.push({ x: e.x0, y: e.y0 });
      }
      continue;
    }
    lineFamilyEllipseIntersectionPoints(
      scratch,
      e.x0,
      e.y0,
      e.x1 - e.x0,
      e.y1 - e.y0,
      'finite',
      cx,
      cy,
      rx,
      ry,
      epsilon
    );
    for (let k = 0; k < scratch.length; k++) {
      const px = scratch[k].x;
      const py = scratch[k].y;
      if (!hasNearbyPoint(outPoints, px, py, epsSq)) {
        outPoints.push({ x: px, y: py });
      }
    }
  }

  // ellipse(첫 번째 입력) 기준 normalized turn 오름차순으로 정렬한다.
  outPoints.sort((p, q) => normalizedTurn(p.x, p.y, cx, cy, rx, ry) - normalizedTurn(q.x, q.y, cx, cy, rx, ry));
  return outPoints;
}

/** 이미 수집한 point 중 (px, py)와 epsilon² 이내가 있으면 true. */
function hasNearbyPoint(points: readonly XYObjectWritable[], px: number, py: number, epsSq: number): boolean {
  for (let i = 0; i < points.length; i++) {
    const ddx = points[i].x - px;
    const ddy = points[i].y - py;
    if (ddx * ddx + ddy * ddy <= epsSq) return true;
  }
  return false;
}

/** degenerate boundary edge(point)가 ellipse boundary 위에 있으면 true. */
function isPointOnEllipseBoundary(
  px: number,
  py: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  epsilon: number
): boolean {
  const ux = (px - cx) / rx;
  const uy = (py - cy) / ry;
  if (!Number.isFinite(ux) || !Number.isFinite(uy)) return false;
  return Math.abs(Math.hypot(ux, uy) - 1) * Math.max(rx, ry) <= epsilon;
}

/** ellipse local 좌표 angle을 normalized turn `[0, 1)`로 반환한다. */
function normalizedTurn(px: number, py: number, cx: number, cy: number, rx: number, ry: number): number {
  const t = Math.atan2((py - cy) / ry, (px - cx) / rx) / (2 * Math.PI);
  return t < 0 ? t + 1 : t;
}
