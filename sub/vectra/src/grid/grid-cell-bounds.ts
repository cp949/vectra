import type { GridCell, GridSpec, RectWritable } from '../types/flat-shapes.internal';
import { gridCellBoundsInto } from './grid-cell-bounds-into';

/**
 * integer cell coordinate가 덮는 rect region을 새 plain `{ x, y, width, height }` object로 반환한다.
 *
 * min corner는 `x = originX + col * cellWidth`, `y = originY + row * cellHeight`이고
 * `width = cellWidth`, `height = cellHeight`다. cell col/row가
 * integer가 아니면(`NaN`, `Infinity`, non-integer float) `RangeError`다. `cellWidth`와 `cellHeight`이
 * positive finite number가 아니거나 origin 성분이 non-finite이면 `RangeError`다. 큰 cell index로
 * min corner가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param cell region을 구할 integer cell coordinate
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellBounds(cell: GridCell, spec: GridSpec): RectWritable {
  return gridCellBoundsInto({ x: 0, y: 0, width: 0, height: 0 }, cell, spec);
}
