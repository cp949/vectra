import {
  readGridCellCol,
  readGridCellRow,
  validateGridCellSafeInteger,
  validateGridCollectionCount,
} from '../internal/grid';
import type { GridCellLike, GridCellWritable } from '../types';

/**
 * start cell에서 end cell까지 inclusive Bresenham integer cell traversal을 start → end order로 out에 기록하고 out을 반환한다.
 *
 * endpoint를 모두 포함하고 major step마다 한 cell만 방문하는 line이다(supercover가 아니다).
 * order는 start cell부터 end cell까지다. start와 end가 같으면 길이 1 collection이다. horizontal,
 * vertical, 45도 diagonal, steep/shallow slope, negative direction 모두 동일한 integer error
 * algorithm으로 deterministic하게 결정한다. col/row가 safe integer가 아니거나(`NaN`, `Infinity`,
 * `-Infinity`, non-integer, safe integer 범위 초과) line length(`max(|Δcol|, |Δrow|) + 1`)가 safe
 * array length(`0xffffffff`)를 넘으면 `RangeError`다. validation이 실패하면 out은 수정하지 않고,
 * 성공 시에만 out을 비우고 새 `{ col, row }` plain object를 push한다.
 *
 * @param out cell collection을 기록할 writable array. 성공 시 비우고 새 object를 push한다.
 * @param start traversal 시작 cell
 * @param end traversal 끝 cell
 */
export function gridLineInto(out: GridCellWritable[], start: GridCellLike, end: GridCellLike): GridCellWritable[] {
  const startCol = readGridCellCol(start);
  const startRow = readGridCellRow(start);
  const endCol = readGridCellCol(end);
  const endRow = readGridCellRow(end);

  validateGridCellSafeInteger(startCol, startRow);
  validateGridCellSafeInteger(endCol, endRow);

  const adx = Math.abs(endCol - startCol);
  const ady = Math.abs(endRow - startRow);
  validateGridCollectionCount(Math.max(adx, ady) + 1);

  const sx = startCol < endCol ? 1 : -1;
  const sy = startRow < endRow ? 1 : -1;
  let col = startCol;
  let row = startRow;
  let err = adx - ady;

  out.length = 0;
  for (;;) {
    out.push({ col, row });
    if (col === endCol && row === endRow) break;
    const e2 = 2 * err;
    // e2 >= -ady이면 major axis인 col을 step하고, e2 <= adx이면 row를 step한다. tie에서는 두 축 모두 step한다.
    if (e2 >= -ady) {
      err -= ady;
      col += sx;
    }
    if (e2 <= adx) {
      err += adx;
      row += sy;
    }
  }
  return out;
}
