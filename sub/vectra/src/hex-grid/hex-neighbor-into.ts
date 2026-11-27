import {
  HEX_AXIAL_DIRECTIONS,
  hexCanonicalZero,
  validateHexAxialSafeInteger,
  validateHexComputedSafeInteger,
  validateHexDirection,
  writeHexAxial,
} from '../internal/hex-grid';
import type { HexAxial, HexAxialWritable } from '../types/flat-shapes.internal';

/**
 * axial coordinate의 direction `0..5` neighbor를 out에 기록하고 out을 반환한다.
 *
 * direction order는 Red Blob Games clockwise axial order다. `0:E(+1,0)`, `1:NE(+1,-1)`,
 * `2:NW(0,-1)`, `3:W(-1,0)`, `4:SW(-1,+1)`, `5:SE(0,+1)`. wraparound는 없다. direction이 `0..5`
 * safe integer가 아니면(`-1`, `6`, non-integer, `NaN`, `Infinity`) `RangeError`다. axial q/r이 safe
 * integer가 아니거나 neighbor q/r이 safe integer 범위를 벗어나면 `RangeError`다. 입력을 모두 읽고
 * validation한 뒤 기록하므로 input/output aliasing이 안전하고, validation 실패 시 out을 수정하지
 * 않는다. 결과 `-0`은 `0`으로 canonicalize한다.
 *
 * @param out neighbor axial 좌표를 기록할 axial 객체
 * @param axial neighbor를 구할 center axial coordinate
 * @param direction `0..5` neighbor direction index
 */
export function hexNeighborInto<Out extends HexAxialWritable>(out: Out, axial: HexAxial, direction: number): Out {
  const q = axial.q;
  const r = axial.r;
  validateHexAxialSafeInteger(q, r);
  validateHexDirection(direction);

  const [dq, dr] = HEX_AXIAL_DIRECTIONS[direction];
  const nq = q + dq;
  const nr = r + dr;
  validateHexComputedSafeInteger(nq, 'q');
  validateHexComputedSafeInteger(nr, 'r');

  return writeHexAxial(out, hexCanonicalZero(nq), hexCanonicalZero(nr));
}
