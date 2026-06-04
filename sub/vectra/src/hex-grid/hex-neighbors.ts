import type { HexAxialLike, HexAxialWritable } from '../types';
import { hexNeighborsInto } from './hex-neighbors-into';

/**
 * axial coordinate의 6개 neighbor를 새 `{ q, r }[]` 배열로 direction `0..5` 순서로 반환한다.
 *
 * order는 Red Blob Games clockwise axial order다. `0:E(+1,0)`, `1:NE(+1,-1)`, `2:NW(0,-1)`,
 * `3:W(-1,0)`, `4:SW(-1,+1)`, `5:SE(0,+1)`. center는 포함하지 않는다. axial q/r이 safe integer가
 * 아니거나 어느 neighbor q/r이 safe integer 범위를 벗어나면 `RangeError`다. 결과 `-0`은 `0`으로
 * canonicalize한다.
 *
 * @param axial neighbor를 구할 center axial coordinate
 */
export function hexNeighbors(axial: HexAxialLike): HexAxialWritable[] {
  return hexNeighborsInto([], axial);
}
