import { readX, readY } from '../internal/xy';
import type { PathCommand, PathMeasurementOptions, XYInput, XYObjectWritable } from '../types/index';
import { flattenInto } from './flatten-into';

/**
 * segment (ax,ay)→(bx,by)가 수평 반직선 px+ 방향에 교차하는 횟수를 winding에 더한다.
 *
 * 표준 winding number 알고리즘: upward crossing → +1, downward crossing → -1.
 * boundary(py === ay 또는 py === by) 처리: 상단 꼭짓점은 포함, 하단 꼭짓점은 제외.
 */
function accumulateWinding(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  if (ay <= py) {
    if (by > py) {
      // upward crossing — point가 segment의 왼쪽이면 winding++
      const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cross > 0) return 1;
    }
  } else {
    if (by <= py) {
      // downward crossing — point가 segment의 오른쪽이면 winding--
      const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cross < 0) return -1;
    }
  }
  return 0;
}

/**
 * polyline 점 배열에서 px/py에 대한 winding number를 누적한다.
 *
 * boundary 교차(px,py가 segment 위에 있음): crossing 조건을 충족하지 않으므로 자연스럽게 0 처리.
 * 단, py가 꼭짓점과 정확히 일치하는 수평 edge 특수 케이스는 상단 포함/하단 제외 규칙으로 처리한다.
 */
function windingFromPolyline(pts: XYObjectWritable[], px: number, py: number): number {
  let w = 0;
  for (let i = 1; i < pts.length; i++) {
    w += accumulateWinding(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, px, py);
  }
  return w;
}

/**
 * subpath를 임시 buffer에 flatten하여 per-subpath winding을 누적한다.
 *
 * subpath boundary는 CloseCommand로 닫히거나 다음 MoveCommand가 등장할 때 결정된다.
 * open subpath(CloseCommand 없음)는 닫힌 면적이 없으므로 winding 기여가 0이 된다.
 */
function computeWinding(
  commands: readonly PathCommand[],
  px: number,
  py: number,
  options?: PathMeasurementOptions
): number {
  if (commands.length === 0) return 0;

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  let totalWinding = 0;

  /** 현재 subpath를 flatten할 임시 buffer. */
  const subpathBuf: XYObjectWritable[] = [];
  /** 현재 subpath의 임시 command buffer. */
  const subpathCmds: PathCommand[] = [];
  /** 현재 subpath가 closed인지 여부. */
  let subClosed = false;
  /** 현재 subpath에 drawing segment가 존재하는지. */
  let hasDrawing = false;
  /** close 후 다음 MoveCommand 없이 drawing segment가 오면 주입할 implicit move 좌표. */
  let implicitMoveX = 0;
  let implicitMoveY = 0;
  /** close flush 이후 다음 drawing segment 전에 implicit move 주입이 필요한 상태. */
  let needsImplicitMove = false;

  /**
   * subpathCmds를 flush — closed이면 winding 계산 후 누적.
   * open subpath는 닫힌 면적이 없으므로 계산을 건너뛴다.
   */
  function flushSubpath(): void {
    if (!hasDrawing || !subClosed) {
      subpathCmds.length = 0;
      hasDrawing = false;
      subClosed = false;
      return;
    }
    flattenInto(subpathBuf, subpathCmds, flatOpts);
    totalWinding += windingFromPolyline(subpathBuf, px, py);
    subpathCmds.length = 0;
    hasDrawing = false;
    subClosed = false;
  }

  let prevWasMove = false;

  for (const cmd of commands) {
    if (cmd.kind === 'move') {
      needsImplicitMove = false;
      flushSubpath();
      subpathCmds.push(cmd);
      implicitMoveX = cmd.x;
      implicitMoveY = cmd.y;
      prevWasMove = true;
      continue;
    }

    if (cmd.kind === 'close') {
      if (!prevWasMove && hasDrawing) {
        subClosed = true;
        subpathCmds.push(cmd);
        flushSubpath();
        // close 후 current = subpath start. 다음 MoveCommand가 없으면 거기서 이어간다.
        needsImplicitMove = true;
      }
      prevWasMove = false;
      continue;
    }

    // drawing segment: close 직후 MoveCommand 없이 왔으면 subpath start에서 암묵적 재개
    if (needsImplicitMove) {
      subpathCmds.push({ kind: 'move', x: implicitMoveX, y: implicitMoveY });
      needsImplicitMove = false;
    }
    hasDrawing = true;
    subpathCmds.push(cmd);
    prevWasMove = false;
  }

  // 마지막 subpath flush (close 없이 끝난 경우 포함)
  flushSubpath();

  return totalWinding;
}

/**
 * commands path에서 point에 대한 부호 있는 winding number를 반환한다.
 *
 * - 양수: 수학 좌표계(y-up)에서 CCW / 화면 좌표계(y-down)에서 CW 방향 우세.
 * - 음수: 수학 좌표계(y-up)에서 CW / 화면 좌표계(y-down)에서 CCW 방향 우세.
 * - 0: path 외부 또는 winding이 상쇄.
 * - empty path → 0.
 * - open subpath(CloseCommand 없음) → 0.
 *
 * @remarks path는 flatness 오차 범위 내에서 근사된다. boundary 근처 결과는 flatness 값에 따라 달라질 수 있다.
 *
 * @param commands - path command sequence
 * @param point - 판정 기준 좌표
 * @param options - flatten 옵션 (flatness, maxRecursion)
 */
export function winding(commands: readonly PathCommand[], point: XYInput, options?: PathMeasurementOptions): number {
  const px = readX(point);
  const py = readY(point);
  return computeWinding(commands, px, py, options);
}
