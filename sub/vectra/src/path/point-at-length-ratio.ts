import type { PathCommand, PathMeasurementOptions, XYObjectWritable } from '../types/index';
import { pointAtLengthRatioInto } from './point-at-length-ratio-into';

/**
 * path의 normalized parameter `ratio` 위치에 해당하는 새 plain point를 반환한다.
 *
 * `pointAtLengthRatioInto`의 allocating companion이다.
 * `ratio` clamp 정책은 `pointAtLength`와 동일 (`ratio * totalLength`를 위임).
 * `ratio <= 0`이면 첫 drawing segment 시작점, `ratio >= 1`이면 마지막 drawing segment 끝점이다.
 * `ratio`가 NaN 또는 +Infinity이면 fallback으로 마지막 drawing segment 끝점이 반환된다
 * (`pointAtLengthRatioInto` 분기 참고). `ratio = -Infinity`이면 시작점이 반환된다.
 * empty / Move-only path → undefined.
 *
 * 내부적으로 `length`와 `pointAtLengthInto`가 path를 각각 한 번씩 순회한다
 * (`pointAtLengthRatioInto` 분기 참고).
 *
 * @param commands sampling할 path command sequence
 * @param ratio normalized parameter (`distance / totalLength`)
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function pointAtLengthRatio(
  commands: readonly PathCommand[],
  ratio: number,
  options?: PathMeasurementOptions
): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return pointAtLengthRatioInto(out, commands, ratio, options) ? out : undefined;
}
