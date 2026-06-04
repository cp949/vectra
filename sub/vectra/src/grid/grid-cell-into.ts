import {
  readGridCellSizeX,
  readGridCellSizeY,
  readGridOriginX,
  readGridOriginY,
  validateGridCellSize,
  validateGridComputedFinite,
  validateGridFinite,
  writeGridCell,
} from '../internal/grid';
import { readX, readY } from '../internal/xy';
import type { GridCellWritable, GridSpecLike, XYInput } from '../types';

/**
 * world point가 속한 integer cell coordinate를 floor division으로 out에 기록하고 out을 반환한다.
 *
 * 산식은 `col = floor((point.x - origin.x) / cellSize.x)`,
 * `row = floor((point.y - origin.y) / cellSize.y)`다. origin은 생략하면 `(0, 0)`이다. cell 경계
 * 위 점은 더 큰 index의 cell에 속한다. negative world coordinate는 truncation이 아니라 floor로
 * 처리한다(origin 0, size 10에서 x `-1`은 col `-1`). `cellSize` 성분이 positive finite number가
 * 아니면(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) `RangeError`다. point 또는 origin 성분이
 * non-finite이면 `RangeError`다. 계산된 cell coordinate가 overflow해 non-finite가 되면
 * `RangeError`이고 out은 수정하지 않는다.
 *
 * @param out cell coordinate를 기록할 writable output
 * @param point cell을 구할 world 좌표
 * @param spec origin과 cellSize를 정의하는 grid spec
 */
export function gridCellInto<Out extends GridCellWritable>(out: Out, point: XYInput, spec: GridSpecLike): Out {
  const px = readX(point);
  const py = readY(point);
  const ox = readGridOriginX(spec);
  const oy = readGridOriginY(spec);
  const sizeX = readGridCellSizeX(spec);
  const sizeY = readGridCellSizeY(spec);

  validateGridFinite(px, py);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);

  const col = Math.floor((px - ox) / sizeX);
  const row = Math.floor((py - oy) / sizeY);
  validateGridComputedFinite(col, row);

  return writeGridCell(out, col, row);
}
