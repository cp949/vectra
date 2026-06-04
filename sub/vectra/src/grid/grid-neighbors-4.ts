import type { GridCellLike, GridCellWritable } from '../types';
import { gridNeighbors4Into } from './grid-neighbors-4-into';

/**
 * cell의 cardinal neighbor 4개를 새 `{ col, row }[]` 배열로 north, east, south, west order로 반환한다.
 *
 * order는 N(`row - 1`), E(`col + 1`), S(`row + 1`), W(`col - 1`)이다. row 증가는 아래 방향이다.
 * center cell은 포함하지 않는다. cell col/row가 safe integer가 아니거나(`NaN`, `Infinity`,
 * `-Infinity`, non-integer, safe integer 범위 초과) neighbor 계산 결과가 safe integer 범위를
 * 벗어나면 `RangeError`다.
 *
 * @param cell neighbor를 구할 center cell
 */
export function gridNeighbors4(cell: GridCellLike): GridCellWritable[] {
  return gridNeighbors4Into([], cell);
}
