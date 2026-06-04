import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { partialInto } from './partial-into';

/**
 * commands에서 normalized ratio `[start, end]` 구간을 추출한 새 PathCommand[] 배열을 반환한다.
 *
 * - `start`, `end`는 `[0, 1]` ratio. `[0, 1]`로 clamp된다.
 * - clamped `start > end` 또는 `start === end` → 빈 배열.
 * - `start === 0 && end === 1` → 입력 commands를 그대로 복사한 새 배열.
 * - empty path 또는 drawing segment가 없는 move-only path → 빈 배열.
 * - `NaN` / `±Infinity` start/end는 JS 비교 결과를 따른다. `clamped > clamped` 비교가 false이므로
 *   명시적 throw 없이 내부 `splitAtLengthInto`의 NaN 동작이 그대로 흐른다. caller 책임.
 *
 * Segment-level split 정책은 `splitAtLengthInto` JSDoc을 참고한다.
 * 성능 최적화가 필요하면 `partialInto`를 사용한다.
 *
 * @param commands 원본 path command sequence (absolute 전제)
 * @param start normalized ratio 시작값 (`[0, 1]`로 clamp)
 * @param end normalized ratio 끝값 (`[0, 1]`로 clamp)
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns 새로 만든 PathCommand 배열
 */
export function partial(
  commands: readonly PathCommand[],
  start: number,
  end: number,
  options?: PathMeasurementOptions
): PathCommand[] {
  return partialInto([], commands, start, end, options);
}
