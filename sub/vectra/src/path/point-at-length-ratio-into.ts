import type { PathCommand, PathMeasurementOptions, XYWritable } from '../types/index';
import { length } from './length';
import { pointAtLengthInto } from './point-at-length-into';

/**
 * path의 normalized parameter `ratio` 위치에 해당하는 point를 out에 기록한다.
 *
 * 내부적으로 `ratio * totalLength`를 `pointAtLengthInto`에 위임한다.
 * `ratio` clamp 정책은 `pointAtLengthInto`와 동일하다.
 * `ratio <= 0`이면 첫 drawing segment 시작점, `ratio >= 1`이면 마지막 drawing segment 끝점이다.
 * `ratio`가 NaN이면 곱 결과도 NaN이고 `pointAtLengthInto` 내부 `distance <= cumulativeLen + segLen`
 * 비교는 모두 false가 되어 forEach가 끝까지 진행된 뒤 fallback으로 **마지막 drawing
 * segment 끝점**이 기록된다. `ratio = +Infinity`도 같은 fallback을 거친다.
 * `ratio = -Infinity`이면 `distance` 비교가 true가 되어 시작점이 기록된다.
 * drawing segment가 없으면 (empty path, Move-only) false를 반환하고 out을 수정하지 않는다.
 *
 * 내부적으로 `length`와 `pointAtLengthInto`가 path를 각각 한 번씩 순회한다.
 *
 * @param out point를 기록할 writable output
 * @param commands sampling할 path command sequence
 * @param ratio normalized parameter (`distance / totalLength`)
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns 기록 성공 시 true, drawing segment 없으면 false
 */
export function pointAtLengthRatioInto(
  out: XYWritable,
  commands: readonly PathCommand[],
  ratio: number,
  options?: PathMeasurementOptions
): boolean {
  const total = length(commands, options);
  return pointAtLengthInto(out, commands, ratio * total, options);
}
