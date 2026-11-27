import {
  validateGridCellSize,
  validateGridCollectionCount,
  validateGridComputedCellRange,
  validateGridFinite,
  validateGridRectFinite,
} from '../internal/grid';
import type { GridCellWritable, GridSpec, Rect } from '../types/flat-shapes.internal';

/**
 * world rect가 면적으로 덮는 integer cell collection을 row-major order로 out에 기록하고 out을 반환한다.
 *
 * col range는 `minCol = floor((x - originX) / cellWidth)`부터
 * `maxCol = ceil((x - originX + width) / cellWidth) - 1`까지, row range는 같은 산식을 y축에
 * 적용한다. order는 row 오름차순, 각 row에서 col 오름차순이다.
 * rect의 오른쪽/아래 edge가 cell boundary에 정확히 닿기만 하면(zero-area 접촉) 다음 cell은
 * 포함하지 않는다. negative world coordinate는 truncation이 아니라 floor로 처리한다. zero width
 * 또는 zero height rect는 empty collection이다. `cellWidth`와 `cellHeight`이 positive finite number가
 * 아니거나(`0`, 음수, `NaN`, `Infinity`, `-Infinity`) origin 성분이 non-finite이거나 rect 성분이
 * non-finite이면 `RangeError`다. width 또는 height가 음수인 inverted rect는 `RangeError`다.
 * positive extent의 계산된 끝 경계가 정밀도 손실로 시작 경계와 같거나 더 작아지면 `RangeError`다.
 * 계산된 cell range boundary가 safe integer가 아니거나 cell 개수가 safe array length(`0xffffffff`)를
 * 넘으면 `RangeError`다. validation이 실패하면 out은 수정하지 않고, 성공 시에만 out을 비우고 새
 * `{ col, row }` plain object를 push한다.
 *
 * @param out cell collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param rect cell coverage를 구할 world rect
 * @param spec 원점과 셀 너비·높이를 정의하는 그리드 객체
 */
export function gridCellsInRectInto(out: GridCellWritable[], rect: Rect, spec: GridSpec): GridCellWritable[] {
  const x = rect.x;
  const y = rect.y;
  const width = rect.width;
  const height = rect.height;
  const ox = spec.originX;
  const oy = spec.originY;
  const sizeX = spec.cellWidth;
  const sizeY = spec.cellHeight;

  validateGridRectFinite(x, y, width, height);
  validateGridFinite(ox, oy);
  validateGridCellSize(sizeX, sizeY);
  if (width < 0 || height < 0) {
    throw new RangeError(`grid rect width/height must be non-negative, got (${String(width)}, ${String(height)})`);
  }

  if (width === 0 || height === 0) {
    out.length = 0;
    return out;
  }

  const startX = x - ox;
  const endX = startX + width;
  const startY = y - oy;
  const endY = startY + height;
  if (endX <= startX || endY <= startY) {
    throw new RangeError('grid rect positive width/height must produce increasing computed extents');
  }

  const minCol = Math.floor(startX / sizeX);
  const maxCol = Math.ceil(endX / sizeX) - 1;
  const minRow = Math.floor(startY / sizeY);
  const maxRow = Math.ceil(endY / sizeY) - 1;

  validateGridComputedCellRange(minCol, 'minCol');
  validateGridComputedCellRange(maxCol, 'maxCol');
  validateGridComputedCellRange(minRow, 'minRow');
  validateGridComputedCellRange(maxRow, 'maxRow');

  const colCount = maxCol - minCol + 1;
  const rowCount = maxRow - minRow + 1;
  validateGridCollectionCount(colCount * rowCount);

  out.length = 0;
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      out.push({ col, row });
    }
  }
  return out;
}
