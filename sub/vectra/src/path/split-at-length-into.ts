import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';
import { splitCommandsAtLength } from './path-slice.internal';

/**
 * commands를 arc-length offset `distance` 위치에서 두 part로 분할하여 outA, outB에 기록한다.
 *
 * - `outA`: 0 ~ distance 구간 path를 그대로 기록한다 (`outA.length = 0` 후 push).
 * - `outB`: distance ~ totalLength 구간 path를 기록한다 (`outB.length = 0` 후 push).
 * - 두 path 모두 absolute-only 정책을 유지하며 split 지점에서 시작하는 새 MoveCommand를 둔다.
 *
 * 경계 처리:
 * - `distance <= 0` → `outA`는 empty, `outB`는 입력 commands를 그대로 복사한다 (reference 보존).
 * - `distance >= totalLength` → `outA`는 입력 commands를 그대로 복사, `outB`는 empty.
 * - empty / move-only path (drawing segment 0개) → `outA`는 empty, `outB`는 입력을 그대로 복사한다
 *   (MoveCommand 정보 보존).
 * - `distance`가 `NaN`이면 JS 비교가 모두 false라 `outA`에 전체 path가 복사되고 `outB`는 empty가 된다.
 *   별도 throw 없음. caller 책임.
 * - `distance`가 `+Infinity`이면 `distance >= totalLength` 분기로 들어가 `outA` 전체 / `outB` empty.
 * - `distance`가 `-Infinity`이면 `distance <= 0` 분기로 들어가 `outA` empty / `outB` 전체.
 *
 * Segment-level split:
 * - line / close: 두 endpoint 비례 split.
 * - quadratic / cubic: `quadraticTAtLength` / `cubicTAtLength`로 arc-length 기준 t를 구한 뒤
 *   `quadraticSplitInto` / `cubicSplitInto`로 두 sub-curve 생성.
 * - arc: endpoint→center 변환 후 `arcTAtLength`로 t를 구해 중간 angle을 결정하고, 두 sub center arc를
 *   `centerArcToEndpointInto`로 endpoint form으로 재변환. split 결과의 `rx`/`ry`/`xRotation`은 SVG
 *   radius correction이 적용된 값이다.
 *
 * dual collection output 함수이므로 반환값이 없다 (`void`).
 *
 * @param outA 0~distance 구간을 기록할 mutable PathCommand 배열
 * @param outB distance~totalLength 구간을 기록할 mutable PathCommand 배열
 * @param commands 분할할 path command sequence (absolute 전제)
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function splitAtLengthInto<OutA extends PathCommand[], OutB extends PathCommand[]>(
  outA: OutA,
  outB: OutB,
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): void {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };

  // aliasing 대비: outA / outB가 commands와 같은 배열이면 clear 전에 snapshot
  const snapshot =
    commands === (outA as readonly PathCommand[]) || commands === (outB as readonly PathCommand[])
      ? Array.from(commands)
      : commands;

  outA.length = 0;
  outB.length = 0;

  if (snapshot.length === 0) {
    return;
  }

  // drawing segment가 없는 path (move-only)는 totalLength = 0이므로 outA empty, outB는 입력 복사.
  let hasDrawing = false;
  forEachDrawSegment(snapshot, () => {
    hasDrawing = true;
  });
  if (!hasDrawing) {
    for (const cmd of snapshot) {
      outB.push(cmd as OutB[number]);
    }
    return;
  }

  if (distance <= 0) {
    // 전체 path → outB. reference 보존.
    for (const cmd of snapshot) {
      outB.push(cmd as OutB[number]);
    }
    return;
  }

  const split = splitCommandsAtLength(outA, outB, snapshot, distance, flatOpts);

  if (!split) {
    // distance >= totalLength fallback: outA에 전체 path. splitCommandsAtLength가 split 없이 끝나면
    // outA에는 첫 drawing segment 직전까지의 command만 들어 있고 그 뒤 segments는 visit 안에서 push한
    // 결과만 들어가 있다. 정확한 전체 복사를 위해 outA를 다시 채운다.
    outA.length = 0;
    outB.length = 0;
    for (const cmd of snapshot) {
      outA.push(cmd as OutA[number]);
    }
  }
}
