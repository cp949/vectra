import { arcFlattenInto } from '../curve/arc-flatten-into';
import { cubicFlattenInto } from '../curve/cubic-flatten-into';
import { endpointArcToCenterInto } from '../curve/endpoint-arc-to-center-into';
import { quadraticFlattenInto } from '../curve/quadratic-flatten-into';
import { segClampedT } from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type {
  CenterArcWritable,
  PathCommand,
  PathMeasurementOptions,
  XYInput,
  XYObjectWritable,
  XYWritable,
} from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';

interface ClosestPointSearchState {
  hasCandidate: boolean;
  bestDistSq: number;
  bestCx: number;
  bestCy: number;
}

/** state 최적값을 flatPts 배열의 index 1 부터 순회하며 갱신한다. */
function updateBestFromPolyline(
  flatPts: XYObjectWritable[],
  qx: number,
  qy: number,
  state: ClosestPointSearchState
): void {
  for (let i = 1; i < flatPts.length; i++) {
    const ax = flatPts[i - 1].x;
    const ay = flatPts[i - 1].y;
    const bx = flatPts[i].x;
    const by = flatPts[i].y;
    const t = segClampedT(ax, ay, bx, by, qx, qy);
    const cx = ax + t * (bx - ax);
    const cy = ay + t * (by - ay);
    const ex = cx - qx;
    const ey = cy - qy;
    const dSq = ex * ex + ey * ey;
    if (!state.hasCandidate || dSq < state.bestDistSq) {
      state.hasCandidate = true;
      state.bestDistSq = dSq;
      state.bestCx = cx;
      state.bestCy = cy;
    }
  }
}

/**
 * commands 위에서 point에 가장 가까운 점을 out에 기록하고 true를 반환한다.
 *
 * forEachDrawSegment 기반으로 각 draw segment를 직접 탐색하므로
 * 다중 subpath 간 gap segment가 nearest 후보로 포함되지 않는다.
 *
 * - empty path → false, out 미수정.
 * - 동거리 candidate → 앞쪽 segment 우선 (strict `<` 비교).
 * - Move-only path (측정 가능한 segment가 없는 경우) → 첫 번째 MoveCommand 위치를 기록하고 true 반환.
 *   첫 command가 MoveCommand가 아니면 implicit origin (0, 0)을 기록하고 true 반환.
 *
 * @param out - 결과를 기록할 XYWritable output
 * @param commands - 탐색 대상 path command sequence
 * @param point - 가장 가까운 점을 찾을 기준 좌표
 * @param options - flatten 옵션 (flatness, maxRecursion)
 */
export function closestPointInto(
  out: XYWritable,
  commands: readonly PathCommand[],
  point: XYInput,
  options?: PathMeasurementOptions
): boolean {
  // empty path는 false 반환, out 미수정
  if (commands.length === 0) return false;

  const qx = readX(point);
  const qy = readY(point);
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  // curve segment를 flatten할 때 재사용하는 임시 버퍼
  const curveBuffer: XYObjectWritable[] = [];
  // arc endpoint→center 변환 결과를 담는 재사용 구조체
  const centerArcBuf: CenterArcWritable = {
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    xRotation: 0,
    startAngle: 0,
    endAngle: 0,
    sweep: false,
  };

  let hasSegment = false;
  const state: ClosestPointSearchState = { hasCandidate: false, bestDistSq: Infinity, bestCx: 0, bestCy: 0 };

  forEachDrawSegment(commands, (seg) => {
    hasSegment = true;

    if (seg.kind === 'line') {
      // line segment: 직접 projection
      const t = segClampedT(seg.fromX, seg.fromY, seg.command.x, seg.command.y, qx, qy);
      const cx = seg.fromX + t * (seg.command.x - seg.fromX);
      const cy = seg.fromY + t * (seg.command.y - seg.fromY);
      const dSq = (cx - qx) ** 2 + (cy - qy) ** 2;
      if (!state.hasCandidate || dSq < state.bestDistSq) {
        state.hasCandidate = true;
        state.bestDistSq = dSq;
        state.bestCx = cx;
        state.bestCy = cy;
      }
      return;
    }

    if (seg.kind === 'close') {
      // close segment: current → subpath start로 직접 projection
      const t = segClampedT(seg.fromX, seg.fromY, seg.subpathStartX, seg.subpathStartY, qx, qy);
      const cx = seg.fromX + t * (seg.subpathStartX - seg.fromX);
      const cy = seg.fromY + t * (seg.subpathStartY - seg.fromY);
      const dSq = (cx - qx) ** 2 + (cy - qy) ** 2;
      if (!state.hasCandidate || dSq < state.bestDistSq) {
        state.hasCandidate = true;
        state.bestDistSq = dSq;
        state.bestCx = cx;
        state.bestCy = cy;
      }
      return;
    }

    if (seg.kind === 'quadratic') {
      // quadratic: 이 segment만 flatten한 뒤 polyline에서 탐색
      const cmd = seg.command;
      quadraticFlattenInto(
        curveBuffer,
        { x: seg.fromX, y: seg.fromY },
        { x: cmd.x1, y: cmd.y1 },
        { x: cmd.x, y: cmd.y },
        flatOpts
      );
      updateBestFromPolyline(curveBuffer, qx, qy, state);
      return;
    }

    if (seg.kind === 'cubic') {
      // cubic: 이 segment만 flatten한 뒤 polyline에서 탐색
      const cmd = seg.command;
      cubicFlattenInto(
        curveBuffer,
        { x: seg.fromX, y: seg.fromY },
        { x: cmd.x1, y: cmd.y1 },
        { x: cmd.x2, y: cmd.y2 },
        { x: cmd.x, y: cmd.y },
        flatOpts
      );
      updateBestFromPolyline(curveBuffer, qx, qy, state);
      return;
    }

    if (seg.kind === 'arc') {
      // arc: endpoint form → center form 변환 후 flatten하여 탐색
      endpointArcToCenterInto(centerArcBuf, { x: seg.fromX, y: seg.fromY }, seg.command);
      arcFlattenInto(curveBuffer, centerArcBuf, flatOpts);
      updateBestFromPolyline(curveBuffer, qx, qy, state);
      return;
    }
  });

  if (!hasSegment) {
    // move-only path: 첫 번째 MoveCommand 위치를 기록
    const first = commands[0];
    if (first.kind === 'move') {
      writeXY(out, first.x, first.y);
    } else {
      // 첫 command가 move가 아니면 implicit origin (0, 0)
      writeXY(out, 0, 0);
    }
    return true;
  }

  writeXY(out, state.bestCx, state.bestCy);
  return true;
}
