import {
  commitHexAxialCollection,
  HEX_AXIAL_DIRECTIONS,
  readHexAxialQ,
  readHexAxialR,
  validateHexAxialSafeInteger,
  validateHexCollectionCount,
  validateHexRadius,
} from '../internal/hex-grid';
import type { HexAxialLike, HexAxialWritable } from '../types';

/**
 * center에서 radius만큼 떨어진 hex ring perimeter를 out에 기록하고 out을 반환한다.
 *
 * radius `0`은 `[center]` 한 개를 반환한다. radius `r > 0`은 `6 * r`개 cell을 deterministic order로
 * 반환한다. traversal은 center에서 direction `4`(SW)를 `radius`만큼 이동한 corner에서 시작해
 * direction `0..5`를 각각 `radius` step씩 걸으며 매 step 직전 좌표를 push한다.
 *
 * radius가 non-negative safe integer가 아니거나(`-1`, non-integer, `NaN`, `Infinity`) center q/r이
 * safe integer가 아니면 `RangeError`다. corner나 어느 step 좌표 q/r이 safe integer 범위를 벗어나거나
 * ring cell 개수(`6 * radius`)가 safe array length(`0xffffffff`)를 넘으면 `RangeError`다. validation
 * 실패 시 out을 수정하지 않고, 성공 시에만 out을 비우고 새 `{ q, r }` plain object를 push한다. 결과
 * `-0`은 `0`으로 canonicalize한다.
 *
 * @param out ring collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param center ring의 center axial coordinate
 * @param radius ring radius. non-negative safe integer
 */
export function hexRingInto(out: HexAxialWritable[], center: HexAxialLike, radius: number): HexAxialWritable[] {
  const cq = readHexAxialQ(center);
  const cr = readHexAxialR(center);
  validateHexAxialSafeInteger(cq, cr);
  validateHexRadius(radius);

  if (radius === 0) {
    return commitHexAxialCollection(out, [[cq, cr]]);
  }

  validateHexCollectionCount(6 * radius);

  // direction 4(SW)를 radius만큼 이동한 corner에서 시작한다.
  const [startDq, startDr] = HEX_AXIAL_DIRECTIONS[4];
  let q = cq + startDq * radius;
  let r = cr + startDr * radius;

  const coords: [number, number][] = [];
  for (const [dq, dr] of HEX_AXIAL_DIRECTIONS) {
    for (let step = 0; step < radius; step++) {
      coords.push([q, r]);
      q += dq;
      r += dr;
    }
  }

  return commitHexAxialCollection(out, coords);
}
