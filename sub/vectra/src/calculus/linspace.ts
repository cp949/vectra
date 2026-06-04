import { linspaceInto } from './linspace-into';
import type { LinspaceOptions } from './types';

/**
 * `xMin..xMax`를 균등 간격으로 나눈 `binCount`개의 sample을 새 `number[]`로 반환한다.
 *
 * `xMin`/`xMax`는 finite number, `binCount`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `endpoint`가 `true`(기본값)이면 마지막 entry는 `xMax`를 직접 기록한다. denominator는 `binCount - 1`이다.
 * `endpoint`가 `false`이면 denominator는 `binCount`이고 마지막 entry는 `xMax`를 포함하지 않는다.
 * `binCount === 0`은 `[]`. `binCount === 1`은 `endpoint` 옵션과 무관하게 `[xMin]`.
 * 산식 결과가 non-finite가 되면 `RangeError`. 결과의 `-0`은 `0`으로 canonicalize한다.
 *
 * @param xMin 첫 entry로 사용할 시작값. finite number.
 * @param xMax `endpoint: true`일 때 마지막 entry로 사용할 끝값. finite number.
 * @param binCount 생성할 sample 개수. 비음의 safe integer.
 * @param options 옵션. `endpoint` 기본 `true`.
 */
export function linspace(xMin: number, xMax: number, binCount: number, options?: LinspaceOptions): number[] {
  return linspaceInto([], xMin, xMax, binCount, options);
}
