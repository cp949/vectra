import {
  hexParity,
  readHexOffsetCol,
  readHexOffsetRow,
  validateHexComputedSafeInteger,
  validateHexOffsetLayout,
  validateHexOffsetSafeInteger,
} from '../internal/hex-grid';
import type { HexAxialWritable, HexOffsetLayout, HexOffsetLike } from '../types';

/**
 * offset hex coordinate를 axial hex coordinate `{ q, r }`로 변환해 새 plain object로 반환한다.
 *
 * Red Blob Games offset convention의 역변환이다. `row`/`col` parity로 shove를 되돌린다.
 * - `"odd-r"`: `q = col - (row - parity(row)) / 2`, `r = row`.
 * - `"even-r"`: `q = col - (row + parity(row)) / 2`, `r = row`.
 * - `"odd-q"`: `q = col`, `r = row - (col - parity(col)) / 2`.
 * - `"even-q"`: `q = col`, `r = row - (col + parity(col)) / 2`.
 *
 * default layout은 없다. `layout`이 `"odd-r" | "even-r" | "odd-q" | "even-q"` 외 값이면
 * `RangeError`다. offset col/row가 safe integer가 아니면(`NaN`, `Infinity`, non-integer float,
 * unsafe integer) `RangeError`다. parity는 음수 safe integer에서도 `0`/`1`로 계산하며 계산 결과가
 * safe integer가 아니면 `RangeError`다.
 *
 * @param offset axial로 변환할 offset coordinate
 * @param layout offset row/column이 어느 parity로 shove됐는지 정하는 layout convention
 */
export function hexOffsetToAxial(offset: HexOffsetLike, layout: HexOffsetLayout): HexAxialWritable {
  const col = readHexOffsetCol(offset);
  const row = readHexOffsetRow(offset);

  validateHexOffsetSafeInteger(col, row);
  validateHexOffsetLayout(layout);

  let q: number;
  let r: number;
  switch (layout) {
    case 'odd-r':
      q = col - (row - hexParity(row)) / 2;
      r = row;
      break;
    case 'even-r':
      q = col - (row + hexParity(row)) / 2;
      r = row;
      break;
    case 'odd-q':
      q = col;
      r = row - (col - hexParity(col)) / 2;
      break;
    case 'even-q':
      q = col;
      r = row - (col + hexParity(col)) / 2;
      break;
  }

  validateHexComputedSafeInteger(q, 'q');
  validateHexComputedSafeInteger(r, 'r');

  return { q, r };
}
