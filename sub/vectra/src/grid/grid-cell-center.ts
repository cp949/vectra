import type { GridCellLike, GridSpecLike, XYObjectWritable } from '../types';
import { gridCellCenterInto } from './grid-cell-center-into';

/**
 * integer cell coordinate의 world center point를 새 plain `{ x, y }` object로 반환한다.
 *
 * 산식은 `x = origin.x + (col + 0.5) * cellSize.x`, `y = origin.y + (row + 0.5) * cellSize.y`다.
 * origin은 생략하면 `(0, 0)`이다. cell col/row가 integer가 아니면(`NaN`, `Infinity`, non-integer
 * float) `RangeError`다. `cellSize` 성분이 positive finite number가 아니거나 origin 성분이
 * non-finite이면 `RangeError`다. 큰 cell index로 결과가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param cell center를 구할 integer cell coordinate
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCellCenter(cell: GridCellLike, spec: GridSpecLike): XYObjectWritable {
  return gridCellCenterInto({ x: 0, y: 0 }, cell, spec);
}
