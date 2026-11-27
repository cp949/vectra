import {
  validateGridCellInteger,
  validateGridCellSize,
  validateGridComputedFinite,
  validateGridFinite,
} from '../internal/grid';
import type { GridCell, GridSpec, RectWritable } from '../types/flat-shapes.internal';

/**
 * integer cell coordinate가 덮는 rect region을 out에 기록하고 out을 반환한다.
 *
 * min corner는 `x = originX + col * cellWidth`, `y = originY + row * cellHeight`이고
 * `width = cellWidth`, `height = cellHeight`다. cell col/row가 integer가 아니면(`NaN`, `Infinity`,
 * non-integer float) `RangeError`다. `cellWidth`와 `cellHeight`가 positive finite number가 아니거나
 * origin 성분이 non-finite이면 `RangeError`다. 큰 cell index로 min corner가 overflow해 non-finite가
 * 되면 `RangeError`다.
 *
 * @param out 셀 경계를 기록할 사각형 객체
 * @param cell region을 구할 integer cell coordinate
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellBoundsInto<Out extends RectWritable>(out: Out, cell: GridCell, spec: GridSpec): Out {
  const col = cell.col;
  const row = cell.row;
  const ox = spec.originX;
  const oy = spec.originY;
  const sizeX = spec.cellWidth;
  const sizeY = spec.cellHeight;

  validateGridCellInteger(col, row);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const x = ox + col * sizeX;
  const y = oy + row * sizeY;
  validateGridComputedFinite(x, y);

  out.x = x;
  out.y = y;
  out.width = sizeX;
  out.height = sizeY;
  return out;
}
