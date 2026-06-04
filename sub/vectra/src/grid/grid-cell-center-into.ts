import {
  readGridCellCol,
  readGridCellRow,
  readGridCellSizeX,
  readGridCellSizeY,
  readGridOriginX,
  readGridOriginY,
  validateGridCellInteger,
  validateGridCellSize,
  validateGridComputedFinite,
  validateGridFinite,
} from '../internal/grid';
import { writeXY } from '../internal/xy';
import type { GridCellLike, GridSpecLike, XYWritable } from '../types';

/**
 * integer cell coordinate의 world center point를 out에 기록하고 out을 반환한다.
 *
 * 산식은 `x = origin.x + (col + 0.5) * cellSize.x`, `y = origin.y + (row + 0.5) * cellSize.y`다.
 * origin은 생략하면 `(0, 0)`이다. cell col/row가 integer가 아니면(`NaN`, `Infinity`, non-integer
 * float) `RangeError`다. `cellSize` 성분이 positive finite number가 아니거나 origin 성분이
 * non-finite이면 `RangeError`다. 큰 cell index로 결과가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param out center point를 기록할 writable output
 * @param cell center를 구할 integer cell coordinate
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCellCenterInto<Out extends XYWritable>(out: Out, cell: GridCellLike, spec: GridSpecLike): Out {
  const col = readGridCellCol(cell);
  const row = readGridCellRow(cell);
  const ox = readGridOriginX(spec);
  const oy = readGridOriginY(spec);
  const sizeX = readGridCellSizeX(spec);
  const sizeY = readGridCellSizeY(spec);

  validateGridCellInteger(col, row);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const cx = ox + (col + 0.5) * sizeX;
  const cy = oy + (row + 0.5) * sizeY;
  validateGridComputedFinite(cx, cy);

  return writeXY(out, cx, cy);
}
