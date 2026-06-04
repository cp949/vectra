import { readX, readY } from '../internal/xy';
import type { PathCommand, PathMeasurementOptions, XYInput, XYObjectWritable } from '../types/index';
import { flattenInto } from './flatten-into';

/**
 * segment (ax,ay)→(bx,by)가 점 (px,py)를 교차하는지 확인하고 crossing count를 반환한다.
 *
 * 수평 반직선(+x 방향) 교차 기반 even-odd rule.
 * boundary 처리: 상단 꼭짓점 포함, 하단 꼭짓점 제외.
 */
function crossingCount(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  // segment가 px,py의 y를 가로지르지 않으면 0
  const upward = ay <= py && by > py;
  const downward = by <= py && ay > py;
  if (!upward && !downward) return 0;

  // px 기준 오른쪽에서 교차해야 count
  // cross product: segment가 px,py의 왼쪽(upward) 또는 오른쪽(downward)에 있는지 판별
  const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  if (upward && cross > 0) return 1;
  if (downward && cross < 0) return 1;
  return 0;
}

/**
 * 점 (px,py)이 edge sequence로 이루어진 closed polyline 내부에 있는지 even-odd rule로 판정한다.
 *
 * boundary(점이 segment 위에 있음)는 cross product === 0으로 crossing 미발생 처리되어
 * 자연스럽게 outside로 분류될 수 있으므로, boundary 판정을 별도로 처리한다.
 */
function isOnSegment(ax: number, ay: number, bx: number, by: number, px: number, py: number): boolean {
  // segment bounding box 안에 있는지 먼저 확인
  if (px < Math.min(ax, bx) || px > Math.max(ax, bx)) return false;
  if (py < Math.min(ay, by) || py > Math.max(ay, by)) return false;
  // cross product로 collinearity 확인
  const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  return cross === 0;
}

function countCrossingsInPolyline(pts: XYObjectWritable[], px: number, py: number): number {
  let count = 0;
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1].x;
    const ay = pts[i - 1].y;
    const bx = pts[i].x;
    const by = pts[i].y;
    // boundary 위에 있으면 즉시 inside 처리 (caller가 확인)
    if (isOnSegment(ax, ay, bx, by, px, py)) return -1;
    count += crossingCount(ax, ay, bx, by, px, py);
  }
  return count;
}

/**
 * commands path가 point를 포함하는지 even-odd fill rule로 판정한다.
 *
 * - empty path → false.
 * - open subpath(CloseCommand 없음) → 닫힌 면적 없음 → false.
 * - boundary touch(점이 edge 위에 있음) → true.
 * - 다중 subpath는 각각 독립적으로 crossing count를 합산한다.
 *
 * @remarks path는 flatness 오차 범위 내에서 근사된다. boundary 근처 결과는 flatness 값에 따라 달라질 수 있다.
 *
 * boundary touch가 `containsPoint`에서는 `true`로 포함되지만, `classifyPoint`에서는
 * `'boundary'`로 분리된다. boundary 판정 동작이 필요하면 `classifyPoint`를 사용한다.
 *
 * @param commands - path command sequence
 * @param point - 판정 기준 좌표
 * @param options - flatten 옵션 (flatness, maxRecursion)
 */
export function containsPoint(
  commands: readonly PathCommand[],
  point: XYInput,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;

  const px = readX(point);
  const py = readY(point);
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  /** 각 closed subpath를 flatten하여 담는 임시 buffer. */
  const subpathBuf: XYObjectWritable[] = [];
  /** 현재 subpath command를 누적하는 buffer. */
  const subpathCmds: PathCommand[] = [];

  let totalCrossings = 0;
  let hasDrawing = false;
  let subClosed = false;
  let prevWasMove = false;
  /** close 후 다음 MoveCommand 없이 drawing segment가 오면 주입할 implicit move 좌표. */
  let implicitMoveX = 0;
  let implicitMoveY = 0;
  /** close flush 이후 다음 drawing segment 전에 implicit move 주입이 필요한 상태. */
  let needsImplicitMove = false;

  /**
   * 누적된 subpathCmds를 평탄화하여 crossing count를 합산한다.
   * open subpath는 건너뛴다.
   */
  function flushSubpath(): void {
    if (!hasDrawing || !subClosed) {
      subpathCmds.length = 0;
      hasDrawing = false;
      subClosed = false;
      return;
    }
    flattenInto(subpathBuf, subpathCmds, flatOpts);
    const c = countCrossingsInPolyline(subpathBuf, px, py);
    if (c === -1) {
      // boundary hit — sentinel으로 표시해 caller가 즉시 true를 반환하도록 함
      totalCrossings = -1;
    } else if (totalCrossings !== -1) {
      totalCrossings += c;
    }
    subpathCmds.length = 0;
    hasDrawing = false;
    subClosed = false;
  }

  for (const cmd of commands) {
    // boundary hit이 이미 확정됐으면 조기 종료
    if (totalCrossings === -1) break;

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

  if (totalCrossings !== -1) {
    flushSubpath();
  }

  if (totalCrossings === -1) return true;
  return totalCrossings % 2 !== 0;
}
