import {
  readGridCellCol,
  readGridCellRow,
  validateGridColumnCount,
  validateGridColumnRange,
  validateGridNonNegativeIndex,
} from '../internal/grid';
import type { GridCellLike } from '../types';

/**
 * row-major grid에서 cell coordinate를 flat index로 변환해 반환한다.
 *
 * 산식은 `row * columnCount + col`이다. col/row는 non-negative safe integer여야 하고
 * columnCount는 positive safe integer여야 한다. col은 `columnCount`보다 작아야 한다.
 * 위반하면 `RangeError`다. 결과 index가 safe integer 범위를 벗어나면 `RangeError`다. int32
 * coercion을 피하려고 bitwise 연산을 쓰지 않는다.
 *
 * @param cell flat index로 변환할 integer cell coordinate
 * @param columnCount grid 한 row의 column 개수
 */
export function gridIndex(cell: GridCellLike, columnCount: number): number {
  const col = readGridCellCol(cell);
  const row = readGridCellRow(cell);

  validateGridNonNegativeIndex(col, 'cell col');
  validateGridNonNegativeIndex(row, 'cell row');
  validateGridColumnCount(columnCount);
  validateGridColumnRange(col, columnCount);

  const index = row * columnCount + col;
  if (!Number.isSafeInteger(index)) {
    throw new RangeError(`grid index overflows safe integer range, got ${String(index)}`);
  }

  return index;
}
