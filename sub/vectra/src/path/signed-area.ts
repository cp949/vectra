import type { PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { flattenInto } from './flatten-into';

/**
 * polyline 점 배열에 shoelace 공식을 적용해 부호 있는 면적의 두 배(Σ xi·yi+1 − xi+1·yi)를 반환한다.
 *
 * 마지막 → 첫 점 edge를 자동으로 적분에 포함한다 (caller가 close 점을 중복 push하지 않아도 된다).
 * caller가 시작 점을 마지막에 다시 push한 경우 마지막 edge가 zero 기여로 흘러간다.
 * 점이 2개 미만이면 0이다.
 */
function shoelaceTwiceArea(pts: XYObjectWritable[]): number {
  if (pts.length < 2) return 0;
  let acc = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = i + 1 === pts.length ? 0 : i + 1;
    acc += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return acc;
}

/**
 * commands path의 부호 있는 면적을 shoelace 공식으로 반환한다.
 *
 * 좌표계 해석은 caller 책임이다. y-down 화면 좌표계에서 `signedArea > 0`을 CW로,
 * y-up 수학 좌표계에서는 `signedArea > 0`을 CCW로 해석한다.
 *
 * - empty path → 0.
 * - Move-only path → 0.
 * - 각 subpath는 독립적으로 flatten 후 shoelace를 적용하고, close 없는 subpath는
 *   해당 subpath의 마지막 점 → 첫 점으로 자동 close하여 적분한다. 다른 subpath로
 *   bridge하지 않는다.
 * - multi-subpath: 각 subpath signed area의 산술 합.
 * - NaN / Infinity / -Infinity 좌표는 validation 없이 그대로 누적되어 결과로 흐른다.
 *
 * @remarks curve segment는 flatness 오차 범위 내에서 polyline으로 근사된 뒤 shoelace를 적용한다.
 *
 * @param commands signed area를 계산할 path command sequence
 * @param options flatten 옵션 (flatness 기본 0.5, maxRecursion 기본 32)
 */
export function signedArea(commands: readonly PathCommand[], options?: PathMeasurementOptions): number {
  if (commands.length === 0) return 0;

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  let total = 0;

  /** 현재 subpath를 flatten할 임시 buffer. */
  const subpathBuf: XYObjectWritable[] = [];
  /** 현재 subpath command를 누적하는 buffer. */
  const subpathCmds: PathCommand[] = [];
  /** 현재 subpath에 drawing segment가 존재하는지. */
  let hasDrawing = false;
  /** 직전 command가 MoveCommand인지. */
  let prevWasMove = false;
  /** close 후 다음 MoveCommand 없이 drawing segment가 오면 주입할 implicit move 좌표. */
  let implicitMoveX = 0;
  let implicitMoveY = 0;
  /** close flush 이후 다음 drawing segment 전에 implicit move 주입이 필요한 상태. */
  let needsImplicitMove = false;

  /** 누적된 subpathCmds를 flatten하여 shoelace 합산. 결과는 close 자동 가정. */
  function flushSubpath(): void {
    if (!hasDrawing) {
      subpathCmds.length = 0;
      return;
    }
    flattenInto(subpathBuf, subpathCmds, flatOpts);
    // shoelace는 closed polygon을 가정하므로 마지막 → 첫 점을 자동 close해서 적분한다.
    // flattenInto가 CloseCommand를 만나면 subpath start 점을 polyline에 push하므로
    // close 있는 subpath는 첫 점 == 마지막 점인 상태가 된다. shoelaceTwiceArea는
    // 마지막 → 첫 점 edge를 항상 추가하지만, 두 점이 같으면 0 기여이므로 안전하다.
    total += shoelaceTwiceArea(subpathBuf) / 2;
    subpathCmds.length = 0;
    hasDrawing = false;
  }

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

  flushSubpath();

  return total;
}
