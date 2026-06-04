import type { GridCellLike, GridCellWritable } from '../types';
import { gridNeighbors8Into } from './grid-neighbors-8-into';

/**
 * cell의 cardinal + diagonal neighbor 8개를 새 `{ col, row }[]` 배열로 north부터 clockwise(N, NE, E, SE, S, SW, W, NW) order로 반환한다.
 *
 * row 증가는 아래 방향이라 north는 `row - 1`이다. center cell은 포함하지 않는다. cell col/row가
 * safe integer가 아니거나(`NaN`, `Infinity`, `-Infinity`, non-integer, safe integer 범위 초과)
 * neighbor 계산 결과가 safe integer 범위를 벗어나면 `RangeError`다.
 *
 * @param cell neighbor를 구할 center cell
 */
export function gridNeighbors8(cell: GridCellLike): GridCellWritable[] {
  return gridNeighbors8Into([], cell);
}
