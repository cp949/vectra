import { magicSquareInto } from './magic-square-into';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `size x size` magic square를 새 `number[][]`로 반환한다.
 *
 * `size`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `size === 2`는 magic square가 존재하지 않으므로 `RangeError`.
 * `1..size*size` 정수를 한 번씩 사용해 모든 row, column, 두 diagonal의 합이
 * magic constant `size * (size * size + 1) / 2`가 되도록 만든다.
 *
 * 알고리즘은 size 패리티에 따라 분기한다.
 * - odd size: Siamese method.
 * - doubly-even (`size % 4 === 0`): complement method.
 * - singly-even (`size % 4 === 2`, `size > 2`): Strachey quadrant method.
 *
 * `size === 0`은 `[]`를 반환한다. `size === 1`은 `[[1]]`.
 * `magicSquare(3)`은 Lo Shu convention `[[8, 1, 6], [3, 5, 7], [4, 9, 2]]`.
 *
 * @param size magic square의 한 변 길이. 비음의 safe integer. `2` 제외.
 */
export function magicSquare(size: number): number[][] {
  assertNonNegativeSafeInteger(size, 'size');
  if (size === 2) {
    throw new RangeError('magic square does not exist for size 2');
  }
  const out: number[][] = new Array(size);
  for (let r = 0; r < size; r++) {
    out[r] = new Array(size);
  }
  return magicSquareInto(out, size);
}
