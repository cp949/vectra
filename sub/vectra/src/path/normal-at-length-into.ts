import { writeXY } from '../internal/xy';
import type { PathCommand, PathMeasurementOptions, XYWritable } from '../types/index';
import { propertiesAtLength } from './properties-at-length';

/**
 * path의 arc-length offset `distance` 위치의 단위 법선 벡터를 out에 기록한다.
 *
 * 접선을 좌측 90° 회전한다: `(tangentX, tangentY) → (-tangentY, tangentX)`.
 * 수학 관례(y-up CCW 기준 좌측 90°)이지만 vectra 기본인 y-down 좌표계에서는
 * 시각적으로 우측 90°로 보인다.
 *
 * distance clamp 정책은 `pointAtLengthInto`와 동일.
 *
 * 정의 가능 여부 분류:
 * - 정의 불가 (drawing segment 없음 = empty / Move-only path) → false 반환, out 미수정.
 * - 정의 가능 + 단위화 실패 (zero-length edge 등) → true 반환, `(0, 0)` 기록.
 * - 정의 가능 → 단위 법선 벡터 기록 + true 반환.
 *
 * non-finite distance(NaN, ±Infinity)는 path domain의 invalid numeric pass-through 정책을
 * 따른다 (`tangentAtLengthInto` 분기 참고).
 *
 * 단위화 실패 시 zero vector는 caller가 사용 전 검증할 책임이다.
 *
 * 내부적으로 `propertiesAtLength`가 path를 한 번 순회한다 (target distance 도달 시 조기 종료).
 *
 * @param out 단위 법선 벡터를 기록할 writable output
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns 법선 정의 가능 시 true (단위화 실패해도 true), 정의 불가 시 false
 */
export function normalAtLengthInto(
  out: XYWritable,
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): boolean {
  const props = propertiesAtLength(commands, distance, options);
  if (props === undefined) return false;
  // 좌측 90° 회전: (tx, ty) → (-ty, tx). zero tangent는 zero normal로 흐른다.
  writeXY(out, -props.tangentY, props.tangentX);
  return true;
}
