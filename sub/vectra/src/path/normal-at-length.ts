import type { PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { normalAtLengthInto } from './normal-at-length-into';

/**
 * path의 arc-length offset `distance` 위치의 단위 법선 벡터를 새 plain object로 반환한다.
 *
 * `normalAtLengthInto`의 allocating companion이다.
 * 접선을 좌측 90° 회전한 단위 벡터 (수학 관례, y-up CCW 기준).
 * y-down 좌표계에서는 시각적으로 우측 90°.
 *
 * 반환 분류:
 * - 정의 불가 (drawing segment 없음 = empty / Move-only path) → undefined.
 * - 정의 가능 + 단위화 실패 → `{ x: 0, y: 0 }`.
 * - 정의 가능 → 단위 법선 벡터.
 *
 * non-finite distance(NaN, ±Infinity)는 path domain의 invalid numeric pass-through 정책을
 * 따른다 (`tangentAtLengthInto` 분기와 동일).
 *
 * 단위화 실패 시 zero vector는 caller가 사용 전 검증할 책임이다.
 *
 * 내부적으로 `propertiesAtLength`가 path를 한 번 순회한다 (`normalAtLengthInto` 분기 참고).
 *
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function normalAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return normalAtLengthInto(out, commands, distance, options) ? out : undefined;
}
