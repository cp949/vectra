import type { PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { tangentAtLengthInto } from './tangent-at-length-into';

/**
 * path의 arc-length offset `distance` 위치의 단위 접선 벡터를 새 plain object로 반환한다.
 *
 * `tangentAtLengthInto`의 allocating companion이다.
 * distance clamp 정책은 `pointAtLength`와 동일.
 *
 * 반환 분류:
 * - 정의 불가 (drawing segment 없음 = empty / Move-only path) → undefined.
 * - 정의 가능 + 단위화 실패 (zero-length edge 등) → `{ x: 0, y: 0 }`.
 * - 정의 가능 → 단위 접선 벡터.
 *
 * non-finite distance(NaN, ±Infinity)는 path domain의 invalid numeric pass-through 정책을
 * 따른다 (`tangentAtLengthInto` 분기 참고).
 *
 * 단위화 실패 시 zero vector는 caller가 사용 전 검증할 책임이다.
 *
 * 내부적으로 `propertiesAtLength`가 path를 한 번 순회한다 (`tangentAtLengthInto` 분기 참고).
 *
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function tangentAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: PathMeasurementOptions
): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return tangentAtLengthInto(out, commands, distance, options) ? out : undefined;
}
