import { commitGridNeighbors, readGridCellCol, readGridCellRow, validateGridCellSafeInteger } from '../internal/grid';
import type { GridCellLike, GridCellWritable } from '../types';

// north, east, south, west. row 증가는 아래 방향이라 north는 row - 1이다.
const NEIGHBORS_4_OFFSETS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

/**
 * cell의 cardinal neighbor 4개를 north, east, south, west order로 out에 기록하고 out을 반환한다.
 *
 * order는 N(`row - 1`), E(`col + 1`), S(`row + 1`), W(`col - 1`)이다. row 증가는 아래 방향이다.
 * center cell은 포함하지 않는다. cell col/row가 safe integer가 아니거나(`NaN`, `Infinity`,
 * `-Infinity`, non-integer, safe integer 범위 초과) neighbor 계산 결과가 safe integer 범위를
 * 벗어나면 `RangeError`다. validation이 실패하면 out은 수정하지 않고, 성공 시에만 out을 비우고 새
 * `{ col, row }` plain object를 push한다.
 *
 * @param out neighbor collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param cell neighbor를 구할 center cell
 */
export function gridNeighbors4Into(out: GridCellWritable[], cell: GridCellLike): GridCellWritable[] {
  const col = readGridCellCol(cell);
  const row = readGridCellRow(cell);
  validateGridCellSafeInteger(col, row);
  return commitGridNeighbors(out, col, row, NEIGHBORS_4_OFFSETS);
}
