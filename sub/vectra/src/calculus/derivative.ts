import { derivativeInto } from './derivative-into';
import type { DerivativeOptions } from './types';

/**
 * `xMin..xMax` 균등 grid에서 sampled function `f`의 finite-difference derivative를 새 `number[]`로 반환한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `options.method`는 `"forward"`/`"backward"`/`"central"` 중 하나여야 한다. 기본 `"central"`.
 * 다른 값이면 `RangeError`.
 * `binCount === 0`은 `[]`을 반환하고 `f`를 호출하지 않는다.
 * `binCount === 1`은 `[0]`을 반환하고 `f`를 호출하지 않는다. 단일 sample에서는 이웃 sample이 없어
 * derivative가 정의되지 않으며 일관된 zero-operator 결과를 반환한다.
 * `binCount >= 2`에서는 endpoint 포함 균등 grid를 사용하며 `xMin < xMax`가 필요하다. 위반 시 `RangeError`.
 * boundary row는 method와 무관하게 one-sided fallback이고 middle row만 method에 따라 달라진다.
 * spacing, scale, `f(x)`, arithmetic 결과 중 하나라도 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로
 * canonicalize한다.
 *
 * @param f grid point마다 호출할 함수. finite number를 반환해야 한다. side effect는 호출자가 책임진다.
 * @param xMin grid 시작값. finite number.
 * @param xMax grid 끝값. finite number이며 `binCount >= 2`에서는 `xMin < xMax`여야 한다.
 * @param binCount 생성할 derivative entry 개수. 비음의 safe integer.
 * @param options 옵션. `method` 기본 `"central"`.
 */
export function derivative(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  binCount: number,
  options?: DerivativeOptions
): number[] {
  return derivativeInto([], f, xMin, xMax, binCount, options);
}
