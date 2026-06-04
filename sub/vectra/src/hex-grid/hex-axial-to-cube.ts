import {
  readHexAxialQ,
  readHexAxialR,
  validateHexAxialSafeInteger,
  validateHexComputedSafeInteger,
} from '../internal/hex-grid';
import type { HexAxialLike, HexCubeWritable } from '../types';

/**
 * axial hex coordinate를 cube hex coordinate `{ q, r, s }`로 변환해 새 plain object로 반환한다.
 *
 * `s = -q - r`로 계산하므로 결과는 `q + r + s === 0` invariant를 만족한다. axial q/r이 safe
 * integer가 아니면(`NaN`, `Infinity`, non-integer float, unsafe integer) `RangeError`다. 계산된
 * `s`가 safe integer 범위를 벗어나면 `RangeError`다. 계산된 `s`가 `-0`이면 `0`으로
 * canonicalize한다.
 *
 * @param axial cube로 변환할 axial coordinate
 */
export function hexAxialToCube(axial: HexAxialLike): HexCubeWritable {
  const q = readHexAxialQ(axial);
  const r = readHexAxialR(axial);

  validateHexAxialSafeInteger(q, r);

  const s = -q - r;
  validateHexComputedSafeInteger(s, 's');

  // 계산된 s가 -0이 되는 경우(q === 0, r === 0)를 0으로 canonicalize한다.
  return { q, r, s: s === 0 ? 0 : s };
}
