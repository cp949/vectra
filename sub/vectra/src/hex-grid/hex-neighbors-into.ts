import {
  commitHexAxialCollection,
  HEX_AXIAL_DIRECTIONS,
  readHexAxialQ,
  readHexAxialR,
  validateHexAxialSafeInteger,
} from '../internal/hex-grid';
import type { HexAxialLike, HexAxialWritable } from '../types';

/**
 * axial coordinate의 6개 neighbor를 direction `0..5` 순서로 out에 기록하고 out을 반환한다.
 *
 * order는 Red Blob Games clockwise axial order다. `0:E(+1,0)`, `1:NE(+1,-1)`, `2:NW(0,-1)`,
 * `3:W(-1,0)`, `4:SW(-1,+1)`, `5:SE(0,+1)`. center는 포함하지 않는다. axial q/r이 safe integer가
 * 아니거나 어느 neighbor q/r이 safe integer 범위를 벗어나면 `RangeError`다. validation 실패 시 out을
 * 수정하지 않고, 성공 시에만 out을 비우고 새 `{ q, r }` plain object 6개를 push한다. 결과 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param out neighbor collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param axial neighbor를 구할 center axial coordinate
 */
export function hexNeighborsInto(out: HexAxialWritable[], axial: HexAxialLike): HexAxialWritable[] {
  const q = readHexAxialQ(axial);
  const r = readHexAxialR(axial);
  validateHexAxialSafeInteger(q, r);

  const coords = HEX_AXIAL_DIRECTIONS.map((direction) => [q + direction[0], r + direction[1]] as const);
  return commitHexAxialCollection(out, coords);
}
