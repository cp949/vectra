import { secondDerivativeInto } from './second-derivative-into';

/**
 * `xMin..xMax` 균등 grid에서 sampled function `f`의 finite-difference second derivative를 새 `number[]`로 반환한다.
 *
 * `f`는 function이어야 한다. function이 아니면 `TypeError`.
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `binCount === 0`은 `[]`. `binCount === 1`은 `[0]`. `binCount === 2`는 `[0, 0]`. 모두 `f`를 호출하지
 * 않는다(zero-operator 결과).
 * `binCount >= 3`에서는 endpoint 포함 균등 grid를 사용한다. 이 경우 `xMin < xMax`가 필요하다.
 * 위반 시 `RangeError`. middle row는 central second-difference, boundary row는 동일 공식의
 * shifted stencil(one-sided second-order fallback)을 사용한다.
 * spacing, scale, `f(x)`, arithmetic 결과 중 하나라도 non-finite면 `RangeError`. 결과의 `-0`은 `0`으로
 * canonicalize한다.
 *
 *
 * tolerance/iteration option 정책은 `secondDerivativeInto`와 동일하다.
 * @param f grid point마다 호출할 함수. finite number를 반환해야 한다. side effect는 호출자가 책임진다.
 * @param xMin grid 시작값. finite number.
 * @param xMax grid 끝값. finite number이며 `binCount >= 3`에서는 `xMin < xMax`여야 한다.
 * @param binCount 생성할 entry 개수. 비음의 safe integer.
 */
export function secondDerivative(f: (x: number) => number, xMin: number, xMax: number, binCount: number): number[] {
  return secondDerivativeInto([], f, xMin, xMax, binCount);
}
