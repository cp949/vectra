import type { HexAxialLike, HexAxialWritable, HexCubeLike } from '../types';
import { hexRoundInto } from './hex-round-into';

/**
 * fractional axial 또는 cube coordinate를 nearest integer axial coordinate로 round해 새 plain
 * `{ q, r }` object로 반환한다.
 *
 * Red Blob Games cube rounding을 사용한다. axial input은 `s = -q - r`로 cube화한다. cube input은
 * `q + r + s` drift를 허용하고 round correction이 output invariant를 복원한다. 세 성분을 round한 뒤
 * rounding delta가 가장 큰 성분을 나머지로부터 다시 계산해 `q + r + s === 0`을 만족시키고 axial
 * `{ q, r }`만 반환한다.
 *
 * input 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. round 결과 q/r과
 * implicit `s = -q - r`가 safe integer가 아니면 `RangeError`다. 결과 `-0`은 `0`으로 canonicalize한다.
 *
 * @param input round할 fractional axial 또는 cube coordinate
 */
export function hexRound(input: HexAxialLike | HexCubeLike): HexAxialWritable {
  return hexRoundInto({ q: 0, r: 0 }, input);
}
