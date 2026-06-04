import { validateGridColumnCount, validateGridNonNegativeIndex, writeGridCell } from '../internal/grid';
import type { GridCellWritable } from '../types';

/**
 * row-major grid에서 flat index를 cell coordinate로 변환해 out에 기록하고 out을 반환한다.
 *
 * 산식은 `col = index % columnCount`, `row = floor(index / columnCount)`다. index는 non-negative
 * safe integer여야 하고 columnCount는 positive safe integer여야 한다. 위반하면 `RangeError`이고
 * 이때 out은 수정하지 않는다(검증을 기록보다 먼저 한다). int32 coercion을 피하려고 bitwise 연산을
 * 쓰지 않는다.
 *
 * @param out cell coordinate를 기록할 writable output
 * @param index cell coordinate로 변환할 flat index
 * @param columnCount grid 한 row의 column 개수
 */
export function gridCoordinatesInto<Out extends GridCellWritable>(out: Out, index: number, columnCount: number): Out {
  validateGridNonNegativeIndex(index, 'index');
  validateGridColumnCount(columnCount);

  return writeGridCell(out, index % columnCount, Math.floor(index / columnCount));
}
