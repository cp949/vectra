import type { HexAxialLike, HexAxialWritable } from '../types';
import { hexRingInto } from './hex-ring-into';

/**
 * center에서 radius만큼 떨어진 hex ring perimeter를 새 `{ q, r }[]` 배열로 반환한다.
 *
 * radius `0`은 `[center]` 한 개를 반환한다. radius `r > 0`은 `6 * r`개 cell을 deterministic order로
 * 반환한다. traversal은 center에서 direction `4`(SW)를 `radius`만큼 이동한 corner에서 시작해
 * direction `0..5`를 각각 `radius` step씩 걷는다.
 *
 * radius가 non-negative safe integer가 아니거나(`-1`, non-integer, `NaN`, `Infinity`) center q/r이
 * safe integer가 아니면 `RangeError`다. corner나 어느 step 좌표 q/r이 safe integer 범위를 벗어나거나
 * ring cell 개수(`6 * radius`)가 safe array length(`0xffffffff`)를 넘으면 `RangeError`다. 결과 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param center ring의 center axial coordinate
 * @param radius ring radius. non-negative safe integer
 */
export function hexRing(center: HexAxialLike, radius: number): HexAxialWritable[] {
  return hexRingInto([], center, radius);
}
