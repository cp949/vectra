import type { GridCellWritable } from '../types';
import { gridCoordinatesInto } from './grid-coordinates-into';

/**
 * row-major grid에서 flat index를 cell coordinate로 변환해 새 plain `{ col, row }` object로 반환한다.
 *
 * 산식은 `col = index % columnCount`, `row = floor(index / columnCount)`다. index는 non-negative
 * safe integer여야 하고 columnCount는 positive safe integer여야 한다. 위반하면 `RangeError`다.
 * int32 coercion을 피하려고 bitwise 연산을 쓰지 않는다.
 *
 * @param index cell coordinate로 변환할 flat index
 * @param columnCount grid 한 row의 column 개수
 */
export function gridCoordinates(index: number, columnCount: number): GridCellWritable {
  return gridCoordinatesInto({ col: 0, row: 0 }, index, columnCount);
}
