import { segDistSq } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PathCommand, PathMeasurementOptions, XYInput, XYObjectWritable } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';
import { createSegmentFlattener } from './segment-flattener.internal';

interface DistanceSearchState {
  hasCandidate: boolean;
  minDistSq: number;
}

/** minDistSq를 flatPts 배열의 index 1 부터 순회하며 갱신하고 새 값을 반환한다. */
function updateMinDistSqFromPolyline(
  flatPts: XYObjectWritable[],
  qx: number,
  qy: number,
  state: DistanceSearchState
): void {
  for (let i = 1; i < flatPts.length; i++) {
    const ax = flatPts[i - 1].x;
    const ay = flatPts[i - 1].y;
    const bx = flatPts[i].x;
    const by = flatPts[i].y;
    const dSq = segDistSq(ax, ay, bx, by, qx, qy);
    if (!state.hasCandidate || dSq < state.minDistSq) {
      state.hasCandidate = true;
      state.minDistSq = dSq;
    }
  }
}

/**
 * commands와 point 사이의 최단 거리를 반환한다.
 *
 * forEachDrawSegment 기반으로 각 draw segment를 직접 탐색하므로
 * 다중 subpath 간 gap segment가 최단 거리 후보로 포함되지 않는다.
 *
 * - empty path → Infinity.
 * - draw segment가 없는 path → 첫 번째 MoveCommand 또는 implicit origin까지의 거리.
 *
 * @param commands - 거리 측정 대상 path command sequence
 * @param point - 기준 좌표
 * @param options - flatten 옵션 (flatness, maxRecursion)
 */
export function distanceToPoint(
  commands: readonly PathCommand[],
  point: XYInput,
  options?: PathMeasurementOptions
): number {
  // empty path는 Infinity 반환
  if (commands.length === 0) return Infinity;

  const qx = readX(point);
  const qy = readY(point);
  const flattener = createSegmentFlattener(options);

  let hasSegment = false;
  const state: DistanceSearchState = { hasCandidate: false, minDistSq: Infinity };

  forEachDrawSegment(commands, (seg) => {
    hasSegment = true;

    if (seg.kind === 'line') {
      // line segment: segDistSq로 직접 거리 제곱 계산
      const dSq = segDistSq(seg.fromX, seg.fromY, seg.command.x, seg.command.y, qx, qy);
      if (!state.hasCandidate || dSq < state.minDistSq) {
        state.hasCandidate = true;
        state.minDistSq = dSq;
      }
      return;
    }

    if (seg.kind === 'close') {
      // close segment: current → subpath start로 segDistSq 계산
      const dSq = segDistSq(seg.fromX, seg.fromY, seg.subpathStartX, seg.subpathStartY, qx, qy);
      if (!state.hasCandidate || dSq < state.minDistSq) {
        state.hasCandidate = true;
        state.minDistSq = dSq;
      }
      return;
    }

    // 곡선: 이 segment만 flatten한 뒤 polyline에서 탐색
    updateMinDistSqFromPolyline(flattener.flatten(seg), qx, qy, state);
  });

  if (!hasSegment) {
    const first = commands[0];
    const fallbackX = first.kind === 'move' ? first.x : 0;
    const fallbackY = first.kind === 'move' ? first.y : 0;
    return Math.hypot(fallbackX - qx, fallbackY - qy);
  }

  return Math.sqrt(state.minDistSq);
}
