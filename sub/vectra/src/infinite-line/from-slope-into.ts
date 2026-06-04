import { writeXY } from '../internal/xy';
import type { InfiniteLineWritable, XYWritable } from '../types';

/**
 * 기울기 `slope`와 `intercept`로 정의되는 직선을 `out`에 기록하고 `out`을 반환한다.
 *
 * finite `slope`: `y = slope * x + intercept`를 표현한다.
 * `origin = { x: 0, y: intercept }`, `direction = { x: 1, y: slope }`.
 * 이때 `intercept`는 y-intercept다.
 *
 * vertical `slope`(`Infinity | -Infinity`): `x = intercept`를 표현한다.
 * `origin = { x: intercept, y: 0 }`, `direction = { x: 0, y: 1 }`.
 * 이때 `intercept`는 x-intercept다.
 *
 * `slope = NaN`은 vertical 분기에 속하지 않으므로 finite 분기 산술 결과로 기록한다:
 * `origin = { x: 0, y: intercept }`, `direction = { x: 1, y: NaN }`.
 *
 * non-finite `intercept`는 검증하지 않고 그대로 기록한다.
 *
 * @param out infinite-line을 기록할 writable output
 * @param slope finite slope이면 `dy/dx`, `Infinity` / `-Infinity`이면 vertical line으로 처리한다
 * @param intercept finite slope에서는 y-intercept, vertical slope에서는 x-intercept. 기본값 `0`
 */
export function fromSlopeInto<Out extends InfiniteLineWritable<XYWritable, XYWritable>>(
  out: Out,
  slope: number,
  intercept = 0
): Out {
  if (slope === Number.POSITIVE_INFINITY || slope === Number.NEGATIVE_INFINITY) {
    writeXY(out.origin, intercept, 0);
    writeXY(out.direction, 0, 1);
    return out;
  }
  writeXY(out.origin, 0, intercept);
  writeXY(out.direction, 1, slope);
  return out;
}
