import type { GridCellLike, GridCellWritable } from '../types';
import { gridLineInto } from './grid-line-into';

/**
 * start cell에서 end cell까지 inclusive Bresenham integer cell traversal을 새 `{ col, row }[]` 배열로 start → end order로 반환한다.
 *
 * endpoint를 모두 포함하고 major step마다 한 cell만 방문하는 line이다(supercover가 아니다).
 * order는 start cell부터 end cell까지다. start와 end가 같으면 길이 1 collection이다. horizontal,
 * vertical, 45도 diagonal, steep/shallow slope, negative direction 모두 동일한 integer error
 * algorithm으로 deterministic하게 결정한다. col/row가 safe integer가 아니거나(`NaN`, `Infinity`,
 * `-Infinity`, non-integer, safe integer 범위 초과) line length(`max(|Δcol|, |Δrow|) + 1`)가 safe
 * array length(`0xffffffff`)를 넘으면 `RangeError`다.
 *
 * @param start traversal 시작 cell
 * @param end traversal 끝 cell
 */
export function gridLine(start: GridCellLike, end: GridCellLike): GridCellWritable[] {
  return gridLineInto([], start, end);
}
