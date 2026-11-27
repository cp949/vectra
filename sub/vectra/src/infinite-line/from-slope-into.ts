import type { InfiniteLineWritable } from '../types/flat-shapes.internal';

/**
 * 기울기 `slope`와 `intercept`로 정의되는 직선을 `out`에 기록하고 `out`을 반환한다.
 *
 * finite `slope`: `y = slope * x + intercept`를 표현한다.
 * `{ ox: 0, oy: intercept }`, `{ dx: 1, dy: slope }`.
 * 이때 `intercept`는 y-intercept다.
 *
 * vertical `slope`(`Infinity | -Infinity`): `x = intercept`를 표현한다.
 * `{ ox: intercept, oy: 0 }`, `{ dx: 0, dy: 1 }`.
 * 이때 `intercept`는 x-intercept다.
 *
 * `slope = NaN`은 vertical 분기에 속하지 않으므로 finite 분기 산술 결과로 기록한다:
 * `{ ox: 0, oy: intercept }`, `{ dx: 1, dy: NaN }`.
 *
 * non-finite `intercept`는 검증하지 않고 그대로 기록한다.
 *
 * @param out 결과를 기록할 무한 직선 객체
 * @param slope finite slope이면 `dy/dx`, `Infinity` / `-Infinity`이면 vertical line으로 처리한다
 * @param intercept finite slope에서는 y-intercept, vertical slope에서는 x-intercept. 기본값 `0`
 */
export function fromSlopeInto<Out extends InfiniteLineWritable>(out: Out, slope: number, intercept = 0): Out {
  if (slope === Number.POSITIVE_INFINITY || slope === Number.NEGATIVE_INFINITY) {
    out.ox = intercept;
    out.oy = 0;
    out.dx = 0;
    out.dy = 1;
    return out;
  }
  out.ox = 0;
  out.oy = intercept;
  out.dx = 1;
  out.dy = slope;
  return out;
}
