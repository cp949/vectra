import {
  hexRoundCubeIntoAxial,
  isHexCubeInput,
  readHexAxialQ,
  readHexAxialR,
  readHexCubeQ,
  readHexCubeR,
  readHexCubeS,
  validateHexCoordinateFinite,
} from '../internal/hex-grid';
import type { HexAxialLike, HexAxialWritable, HexCubeLike } from '../types';

/**
 * fractional axial 또는 cube coordinate를 nearest integer axial coordinate로 round해 out에 기록하고
 * out을 반환한다.
 *
 * Red Blob Games cube rounding을 사용한다. axial input은 `s = -q - r`로 cube화한다. cube input은
 * `q + r + s` drift를 허용하고 round correction이 output invariant를 복원한다. 세 성분을 round한 뒤
 * rounding delta가 가장 큰 성분을 나머지로부터 다시 계산해 `q + r + s === 0`을 만족시키고 axial
 * `{ q, r }`만 기록한다.
 *
 * input 성분이 non-finite(`NaN`, `Infinity`, `-Infinity`)이면 `RangeError`다. round 결과 q/r과
 * implicit `s = -q - r`가 safe integer가 아니면 `RangeError`다. 결과 `-0`은 `0`으로 canonicalize한다.
 * 입력을 모두 읽고 validation한 뒤 기록하므로 input/output aliasing이 안전하고, validation 실패 시
 * out을 수정하지 않는다.
 *
 * @param out nearest integer axial coordinate를 기록할 writable output
 * @param input round할 fractional axial 또는 cube coordinate
 */
export function hexRoundInto<Out extends HexAxialWritable>(out: Out, input: HexAxialLike | HexCubeLike): Out {
  let fq: number;
  let fr: number;
  let fs: number;
  if (isHexCubeInput(input)) {
    fq = readHexCubeQ(input);
    fr = readHexCubeR(input);
    fs = readHexCubeS(input);
  } else {
    fq = readHexAxialQ(input);
    fr = readHexAxialR(input);
    fs = -fq - fr;
  }

  validateHexCoordinateFinite(fq, fr, fs);

  return hexRoundCubeIntoAxial(out, fq, fr, fs);
}
