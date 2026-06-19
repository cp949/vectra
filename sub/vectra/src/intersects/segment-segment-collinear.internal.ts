import type { SegmentSegmentDetail } from '../types';
import {
  allFinite,
  clamp01,
  interpolateCoord,
  normalizeZero,
  parameterOnSegmentPoint,
  pointAgreesWithSegment,
  pointPointDist,
} from './segment-segment-geometry.internal';

/** 매 호출 fresh none result를 반환한다. 공유 상수를 재사용하지 않는다. */
function none(): SegmentSegmentDetail {
  return { kind: 'none' };
}

export interface CollinearCandidate {
  x: number;
  y: number;
  tA: number;
  tB: number;
}

export interface CollinearMappedInterval {
  startTA: number;
  endTA: number;
  startTB: number;
  endTB: number;
}

export interface CollinearCandidateContext {
  ax0: number;
  ay0: number;
  ax1: number;
  ay1: number;
  bx0: number;
  by0: number;
  bx1: number;
  by1: number;
  epsilon: number;
}

export function collinearOverlapCandidates(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): CollinearCandidate[] {
  const candidates: CollinearCandidate[] = [];
  const context: CollinearCandidateContext = { ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon };
  addCandidate(candidates, ax0, ay0, 0, parameterOnSegmentPoint(ax0, ay0, bx0, by0, bx1, by1), context);
  addCandidate(candidates, ax1, ay1, 1, parameterOnSegmentPoint(ax1, ay1, bx0, by0, bx1, by1), context);
  addCandidate(candidates, bx0, by0, parameterOnSegmentPoint(bx0, by0, ax0, ay0, ax1, ay1), 0, context);
  addCandidate(candidates, bx1, by1, parameterOnSegmentPoint(bx1, by1, ax0, ay0, ax1, ay1), 1, context);
  const axis = collinearSortAxis(ax0, ay0, ax1, ay1);
  candidates.sort((left, right) => axis.key(left.x, left.y) - axis.key(right.x, right.y));
  return candidates;
}

export function collinearMappedInterval(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  tBo: number
): CollinearMappedInterval | null | undefined {
  // 반환 의미: interval object = A 축에서 겹치는 구간, null = 계산됐지만 겹치지 않음,
  // undefined = overflow 등으로 계산 불가(caller가 endpoint 후보 경로로 fallback).
  const bEndT = parameterOnSegmentPoint(bx1, by1, ax0, ay0, ax1, ay1);
  if (!allFinite(bEndT)) return undefined;

  const s = bEndT - tBo;
  if (!allFinite(s) || s === 0) return undefined;

  const bLoOnA = Math.min(tBo, bEndT);
  const bHiOnA = Math.max(tBo, bEndT);
  const startTA = Math.max(0, bLoOnA);
  const endTA = Math.min(1, bHiOnA);
  if (startTA > endTA) return null;

  const startTB = (startTA - tBo) / s;
  const endTB = (endTA - tBo) / s;
  if (!allFinite(startTB, endTB)) return undefined;

  return { startTA, endTA, startTB, endTB };
}

export function collinearOverlapFromMappedInterval(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  interval: CollinearMappedInterval,
  epsilon: number
): SegmentSegmentDetail {
  const start = {
    x: interpolateCoord(ax0, ax1, interval.startTA),
    y: interpolateCoord(ay0, ay1, interval.startTA),
    tA: clamp01(interval.startTA),
    tB: clamp01(interval.startTB),
  };
  const end = {
    x: interpolateCoord(ax0, ax1, interval.endTA),
    y: interpolateCoord(ay0, ay1, interval.endTA),
    tA: clamp01(interval.endTA),
    tB: clamp01(interval.endTB),
  };
  if (!allFinite(start.x, start.y, end.x, end.y)) return none();

  const overlapDistance = pointPointDist(start.x, start.y, end.x, end.y);
  if (overlapDistance <= epsilon) {
    if (!pointAgreesWithSegment(start.x, start.y, ax0, ay0, ax1, ay1, start.tA, epsilon)) return none();
    if (!pointAgreesWithSegment(start.x, start.y, bx0, by0, bx1, by1, start.tB, epsilon)) return none();
    return { kind: 'point', point: { x: start.x, y: start.y }, tA: start.tA, tB: start.tB };
  }
  const bStart = { x: interpolateCoord(bx0, bx1, start.tB), y: interpolateCoord(by0, by1, start.tB) };
  const bEnd = { x: interpolateCoord(bx0, bx1, end.tB), y: interpolateCoord(by0, by1, end.tB) };
  if (!allFinite(bStart.x, bStart.y, bEnd.x, bEnd.y)) return none();
  if (pointPointDist(bStart.x, bStart.y, bEnd.x, bEnd.y) <= epsilon) return none();

  return {
    kind: 'overlap',
    start: { x: start.x, y: start.y },
    end: { x: end.x, y: end.y },
    tA: [start.tA, end.tA],
    tB: [start.tB, end.tB],
  };
}

export function addCandidate(
  candidates: CollinearCandidate[],
  x: number,
  y: number,
  tA: number,
  tB: number,
  context: CollinearCandidateContext
): void {
  if (!allFinite(x, y, tA, tB)) return;
  if (tA < 0 || tA > 1 || tB < 0 || tB > 1) return;
  const { ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, epsilon } = context;
  if (!pointAgreesWithSegment(x, y, ax0, ay0, ax1, ay1, tA, epsilon)) return;
  if (!pointAgreesWithSegment(x, y, bx0, by0, bx1, by1, tB, epsilon)) return;
  if (candidates.some((candidate) => pointPointDist(candidate.x, candidate.y, x, y) <= epsilon)) return;
  // tA/tB는 위 range gate로 이미 [0, 1]이다. clamp가 아니라 -0 부호만 정규화한다.
  candidates.push({ x, y, tA: normalizeZero(tA), tB: normalizeZero(tB) });
}

export function collinearSortAxis(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number
): { key: (x: number, y: number) => number } {
  const scale = Math.max(Math.abs(ax0), Math.abs(ay0), Math.abs(ax1), Math.abs(ay1));
  if (!Number.isFinite(scale) || scale === 0) return { key: (x) => x };
  const dx = ax1 / scale - ax0 / scale;
  const dy = ay1 / scale - ay0 / scale;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const sign = Math.sign(dx) || 1;
    return { key: (x) => sign * x };
  }
  const sign = Math.sign(dy) || 1;
  return { key: (_x, y) => sign * y };
}
