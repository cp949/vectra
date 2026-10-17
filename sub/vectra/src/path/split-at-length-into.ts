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
 * 길이 척도 (segment 선택과 segment 안의 t가 서로 다르다):
 * - segment 선택: flatten 폴리라인 길이(`measureSegmentLength`)의 누적값으로 고른다. `pointAtLength`와 같은 척도다.
 * - segment 안의 t: `quadraticTAtLength` / `cubicTAtLength` / `arcTAtLength`가 곡선 호 길이(GL5 적분)로 구한다.
 * - flatten 폴리라인은 곡선보다 짧다. 같은 `local` 값이 두 척도에서 다른 위치를 가리킨다.
 * - 그래서 분할점이 같은 distance의 `pointAtLength` 위치와 어긋날 수 있다.
 * - 어긋남은 quadratic / cubic / arc segment 안에서만 생긴다. line / close는 일치한다.
 * - 관측값: 기본 옵션(flatness 0.5)에서 곡선 2개짜리 path의 분할점과 `pointAtLength` 위치 거리를 쟀다.
 *   고정 path 6개(cubic 2개, quadratic 2개, cubic+quadratic, 길이 32–400)는 0.06–0.20 좌표 단위였다.
 *   무작위 path 300개(좌표 ±100, 지점 60곳 표본)의 최대는 cubic 2개 약 0.21, quadratic 2개 약 0.30이었다.
 *   arc는 측정하지 않았다. 관측값이며 상한 보장이 아니다.
 *
 * dual collection output 함수이므로 반환값이 없다 (`void`).
 *
 * @param outA 0~distance 구간을 기록할 mutable PathCommand 배열
 * @param outB distance~totalLength 구간을 기록할 mutable PathCommand 배열
 * @param commands 분할할 path command sequence (absolute 전제)
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function splitAtLengthInto(
  outA: PathCommand[],
  outB: PathCommand[],
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): void {
  // aliasing 대비: outA / outB가 commands와 같은 배열이면 clear 전에 snapshot
  const snapshot = commands === outA || commands === outB ? Array.from(commands) : commands;

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
      outB.push(cmd);
    }
    return;
  }

  if (distance <= 0) {
    // 전체 path → outB. reference 보존.
    for (const cmd of snapshot) {
      outB.push(cmd);
    }
    return;
  }

  const split = splitCommandsAtLength(outA, outB, snapshot, distance, options);

  if (!split) {
    // distance >= totalLength fallback: outA에 전체 path. splitCommandsAtLength가 split 없이 끝나면
    // outA에는 첫 drawing segment 직전까지의 command만 들어 있고 그 뒤 segments는 visit 안에서 push한
    // 결과만 들어가 있다. 정확한 전체 복사를 위해 outA를 다시 채운다.
    outA.length = 0;
    outB.length = 0;
    for (const cmd of snapshot) {
      outA.push(cmd);
    }
  }
}
