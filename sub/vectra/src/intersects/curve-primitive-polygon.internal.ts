/**
 * Bezier curve × polygon-family(rect/bounds/triangle) boolean relation (internal 전용).
 *
 * primitive edge를 segment로 분해해 curve numeric kernel(probe)로 교차를 보고하고, primitive가
 * curve를 둘러싸는 containment-only case는 endpoint containment fallback으로 잡는다.
 * empty/inverted/degenerate primitive는 early gate로 false를 반환한다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import { rectContainsPointXY } from '../internal/polygon';
import type { IntersectionHit } from '../types';
import type { CurveLineProbe } from './curve-primitive-probe.internal';
import { curveCrossesSegment } from './curve-primitive-segment.internal';

/**
 * Bezier curve와 rect가 교차하면 true를 반환한다.
 *
 * - empty rect (width ≤ 0 또는 height ≤ 0): false.
 * - endpoint가 rect 내부(경계 포함)이거나 curve가 rect 경계를 가로지르면 true.
 * - rect가 curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param rx rect x
 * @param ry rect y
 * @param rw rect width
 * @param rh rect height
 */
export function curveRectIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  if (rw <= 0 || rh <= 0) return false;
  if (rectContainsPointXY(rx, ry, rw, rh, p0x, p0y)) return true;
  if (rectContainsPointXY(rx, ry, rw, rh, pLastx, pLasty)) return true;

  const x1 = rx + rw;
  const y1 = ry + rh;
  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, rx, ry, x1, ry) ||
    curveCrossesSegment(probe, hits, x1, ry, x1, y1) ||
    curveCrossesSegment(probe, hits, x1, y1, rx, y1) ||
    curveCrossesSegment(probe, hits, rx, y1, rx, ry)
  );
}

/**
 * Bezier curve와 axis-aligned bounds가 교차하면 true를 반환한다.
 *
 * - inverted bounds (min > max): false. zero-extent bounds는 유효 입력이다.
 * - endpoint가 bounds 내부(경계 포함)이거나 curve가 bounds 경계를 가로지르면 true.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param x0 bounds min x
 * @param y0 bounds min y
 * @param x1 bounds max x
 * @param y1 bounds max y
 */
export function curveBoundsIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  if (x1 < x0 || y1 < y0) return false;
  if (p0x >= x0 && p0x <= x1 && p0y >= y0 && p0y <= y1) return true;
  if (pLastx >= x0 && pLastx <= x1 && pLasty >= y0 && pLasty <= y1) return true;

  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, x0, y0, x1, y0) ||
    curveCrossesSegment(probe, hits, x1, y0, x1, y1) ||
    curveCrossesSegment(probe, hits, x1, y1, x0, y1) ||
    curveCrossesSegment(probe, hits, x0, y1, x0, y0)
  );
}

/**
 * Bezier curve와 triangle이 교차하면 true를 반환한다.
 *
 * - degenerate triangle (signed area 2× === 0): false.
 * - endpoint가 triangle 내부(경계 포함)이거나 curve가 triangle 변을 가로지르면 true.
 * - triangle이 curve를 완전히 둘러싸는 case는 endpoint containment로 잡는다.
 *
 * @param probe curve × infinite-line numeric kernel probe
 * @param p0x curve 시작점 x
 * @param p0y curve 시작점 y
 * @param pLastx curve 끝점 x
 * @param pLasty curve 끝점 y
 * @param ax triangle vertex a x
 * @param ay triangle vertex a y
 * @param bx triangle vertex b x
 * @param by triangle vertex b y
 * @param cx triangle vertex c x
 * @param cy triangle vertex c y
 */
export function curveTriangleIntersects(
  probe: CurveLineProbe,
  p0x: number,
  p0y: number,
  pLastx: number,
  pLasty: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2 === 0) return false;

  // 점이 triangle 내부(경계 포함)인지 barycentric cross-product 부호로 판정한다.
  const contains = (px: number, py: number): boolean => {
    const d1 = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
    const d2 = (px - bx) * (cy - by) - (py - by) * (cx - bx);
    const d3 = (px - cx) * (ay - cy) - (py - cy) * (ax - cx);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  if (contains(p0x, p0y)) return true;
  if (contains(pLastx, pLasty)) return true;

  const hits: IntersectionHit[] = [];
  return (
    curveCrossesSegment(probe, hits, ax, ay, bx, by) ||
    curveCrossesSegment(probe, hits, bx, by, cx, cy) ||
    curveCrossesSegment(probe, hits, cx, cy, ax, ay)
  );
}
