import type { GridCell, GridSpec, PointWritable } from '../types/flat-shapes.internal';
import { gridCellCenterInto } from './grid-cell-center-into';

/**
 * integer cell coordinate의 world center point를 새 plain `{ x, y }` object로 반환한다.
 *
 * 산식은 `x = originX + (col + 0.5) * cellWidth`, `y = originY + (row + 0.5) * cellHeight`다.
 * cell col/row가 integer가 아니면(`NaN`, `Infinity`, non-integer float) `RangeError`다.
 * `cellWidth`와 `cellHeight`가 positive finite number가 아니거나 origin 성분이 non-finite이면
 * `RangeError`다. 큰 cell index로 결과가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param cell center를 구할 integer cell coordinate
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellCenter(cell: GridCell, spec: GridSpec): PointWritable {
  return gridCellCenterInto({ x: 0, y: 0 }, cell, spec);
}
