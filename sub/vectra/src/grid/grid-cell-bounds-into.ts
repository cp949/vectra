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
import type { GridCellLike, GridSpecLike, RectWritable } from '../types';

/**
 * integer cell coordinate가 덮는 rect region을 out에 기록하고 out을 반환한다.
 *
 * min corner는 `x = origin.x + col * cellSize.x`, `y = origin.y + row * cellSize.y`이고
 * `width = cellSize.x`, `height = cellSize.y`다. origin은 생략하면 `(0, 0)`이다. cell col/row가
 * integer가 아니면(`NaN`, `Infinity`, non-integer float) `RangeError`다. `cellSize` 성분이
 * positive finite number가 아니거나 origin 성분이 non-finite이면 `RangeError`다. 큰 cell index로
 * min corner가 overflow해 non-finite가 되면 `RangeError`다.
 *
 * @param out rect region을 기록할 writable output
 * @param cell region을 구할 integer cell coordinate
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCellBoundsInto<Out extends RectWritable>(out: Out, cell: GridCellLike, spec: GridSpecLike): Out {
  const col = readGridCellCol(cell);
  const row = readGridCellRow(cell);
  const ox = readGridOriginX(spec);
  const oy = readGridOriginY(spec);
  const sizeX = readGridCellSizeX(spec);
  const sizeY = readGridCellSizeY(spec);

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
