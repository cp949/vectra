import type { HexAxialLike, HexAxialWritable } from '../types';
import { hexNeighborInto } from './hex-neighbor-into';

/**
 * axial coordinate의 direction `0..5` neighbor를 새 plain `{ q, r }` object로 반환한다.
 *
 * direction order는 Red Blob Games clockwise axial order다. `0:E(+1,0)`, `1:NE(+1,-1)`,
 * `2:NW(0,-1)`, `3:W(-1,0)`, `4:SW(-1,+1)`, `5:SE(0,+1)`. wraparound는 없다. direction이 `0..5`
 * safe integer가 아니면(`-1`, `6`, non-integer, `NaN`, `Infinity`) `RangeError`다. axial q/r이 safe
 * integer가 아니거나 neighbor q/r이 safe integer 범위를 벗어나면 `RangeError`다. 결과 `-0`은 `0`으로
 * canonicalize한다.
 *
 * @param axial neighbor를 구할 center axial coordinate
 * @param direction `0..5` neighbor direction index
 */
export function hexNeighbor(axial: HexAxialLike, direction: number): HexAxialWritable {
  return hexNeighborInto({ q: 0, r: 0 }, axial, direction);
}
