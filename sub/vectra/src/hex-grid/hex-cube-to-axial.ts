import {
  readHexCubeQ,
  readHexCubeR,
  readHexCubeS,
  validateHexCubeSafeInteger,
  validateHexCubeZeroSum,
} from '../internal/hex-grid';
import type { HexAxialWritable, HexCubeLike } from '../types';

/**
 * cube hex coordinate를 axial hex coordinate `{ q, r }`로 변환해 새 plain object로 반환한다.
 *
 * cube q/r/s가 safe integer가 아니면(`NaN`, `Infinity`, non-integer float, unsafe integer)
 * `RangeError`다. `q + r + s === 0` invariant를 위반하면 `RangeError`다. `s`는 drop하고 axial
 * `{ q, r }`만 반환한다.
 *
 * @param cube axial로 변환할 cube coordinate
 */
export function hexCubeToAxial(cube: HexCubeLike): HexAxialWritable {
  const q = readHexCubeQ(cube);
  const r = readHexCubeR(cube);
  const s = readHexCubeS(cube);

  validateHexCubeSafeInteger(q, r, s);
  validateHexCubeZeroSum(q, r, s);

  return { q, r };
}
