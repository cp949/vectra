import {
  hexParity,
  readHexAxialQ,
  readHexAxialR,
  validateHexAxialSafeInteger,
  validateHexComputedSafeInteger,
  validateHexOffsetLayout,
} from '../internal/hex-grid';
import type { HexAxialLike, HexOffsetLayout, HexOffsetWritable } from '../types';

/**
 * axial hex coordinate를 offset hex coordinate `{ col, row }`로 변환해 새 plain object로 반환한다.
 *
 * Red Blob Games offset convention을 따른다. `r`/`q` 행·열의 parity로 좌표를 shove한다.
 * - `"odd-r"`: `col = q + (r - parity(r)) / 2`, `row = r`.
 * - `"even-r"`: `col = q + (r + parity(r)) / 2`, `row = r`.
 * - `"odd-q"`: `col = q`, `row = r + (q - parity(q)) / 2`.
 * - `"even-q"`: `col = q`, `row = r + (q + parity(q)) / 2`.
 *
 * default layout은 없다. `layout`이 `"odd-r" | "even-r" | "odd-q" | "even-q"` 외 값이면
 * `RangeError`다. axial q/r이 safe integer가 아니면(`NaN`, `Infinity`, non-integer float, unsafe
 * integer) `RangeError`다. parity는 음수 safe integer에서도 `0`/`1`로 계산하며 계산 결과가 safe
 * integer가 아니면 `RangeError`다.
 *
 * @param axial offset으로 변환할 axial coordinate
 * @param layout offset row/column이 어느 parity로 shove되는지 정하는 layout convention
 */
export function hexAxialToOffset(axial: HexAxialLike, layout: HexOffsetLayout): HexOffsetWritable {
  const q = readHexAxialQ(axial);
  const r = readHexAxialR(axial);

  validateHexAxialSafeInteger(q, r);
  validateHexOffsetLayout(layout);

  let col: number;
  let row: number;
  switch (layout) {
    case 'odd-r':
      col = q + (r - hexParity(r)) / 2;
      row = r;
      break;
    case 'even-r':
      col = q + (r + hexParity(r)) / 2;
      row = r;
      break;
    case 'odd-q':
      col = q;
      row = r + (q - hexParity(q)) / 2;
      break;
    case 'even-q':
      col = q;
      row = r + (q + hexParity(q)) / 2;
      break;
  }

  validateHexComputedSafeInteger(col, 'col');
  validateHexComputedSafeInteger(row, 'row');

  return { col, row };
}
