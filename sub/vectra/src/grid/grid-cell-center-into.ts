import {
  validateGridCellInteger,
  validateGridCellSize,
  validateGridComputedFinite,
  validateGridFinite,
} from '../internal/grid';
import type { GridCell, GridSpec, PointWritable } from '../types/flat-shapes.internal';

/**
 * integer cell coordinate의 world center point를 out에 기록하고 out을 반환한다.
 *
 * 산식은 `x = originX + (col + 0.5) * cellWidth`, `y = originY + (row + 0.5) * cellHeight`다.
 * cell col/row가 integer가 아니면(`NaN`, `Infinity`, non-integer float) `RangeError`다.
 * `cellWidth`와 `cellHeight`가 positive finite number가 아니거나 origin 성분이 non-finite이면
 * `RangeError`다. 큰 cell index로 결과가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param out center point를 기록할 점 객체
 * @param cell center를 구할 integer cell coordinate
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellCenterInto<Out extends PointWritable>(out: Out, cell: GridCell, spec: GridSpec): Out {
  const col = cell.col;
  const row = cell.row;
  const ox = spec.originX;
  const oy = spec.originY;
  const sizeX = spec.cellWidth;
  const sizeY = spec.cellHeight;

  validateGridCellInteger(col, row);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const cx = ox + (col + 0.5) * sizeX;
  const cy = oy + (row + 0.5) * sizeY;
  validateGridComputedFinite(cx, cy);

  out.x = cx;
  out.y = cy;
  return out;
}
