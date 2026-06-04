import type { GridCellLike, GridSpecLike, RectWritable } from '../types';
import { gridCellBoundsInto } from './grid-cell-bounds-into';

/**
 * integer cell coordinate가 덮는 rect region을 새 plain `{ x, y, width, height }` object로 반환한다.
 *
 * min corner는 `x = origin.x + col * cellSize.x`, `y = origin.y + row * cellSize.y`이고
 * `width = cellSize.x`, `height = cellSize.y`다. origin은 생략하면 `(0, 0)`이다. cell col/row가
 * integer가 아니면(`NaN`, `Infinity`, non-integer float) `RangeError`다. `cellSize` 성분이
 * positive finite number가 아니거나 origin 성분이 non-finite이면 `RangeError`다. 큰 cell index로
 * min corner가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param cell region을 구할 integer cell coordinate
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCellBounds(cell: GridCellLike, spec: GridSpecLike): RectWritable {
  return gridCellBoundsInto({ x: 0, y: 0, width: 0, height: 0 }, cell, spec);
}
