import { assertMatrixOutCapacity } from './matrix-out-capacity.internal';
import type { MatWritable } from './types';
import { assertNonNegativeSafeInteger } from './validate.internal';

/**
 * `size x size` magic square를 `out`에 기록한다.
 *
 * `size`는 비음의 safe integer여야 한다. 위반 시 `RangeError`.
 * `size === 2`는 magic square가 존재하지 않으므로 `RangeError`.
 * `out`은 최소 `size`개의 row를 가져야 하며 각 row(`r < size`)는 `size` 이상의 capacity를 가진 array여야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(모든 validation 성공 후에만 mutate).
 * 성공 시 `1..size*size` 정수를 한 번씩 사용해 모든 row sum, column sum, 두 diagonal sum이
 * magic constant `size * (size * size + 1) / 2`가 되도록 기록하고, `out.length`는 `size`로,
 * 각 row length는 `size`로 truncate된다.
 *
 * 알고리즘은 size 패리티에 따라 분기한다.
 * - odd size: Siamese method (top-middle에서 1로 시작, up-right 이동, 충돌 시 down).
 * - doubly-even (`size % 4 === 0`): 4x4 패턴으로 절반 entry를 `n² + 1 - v`로 complement.
 * - singly-even (`size % 4 === 2`, `size > 2`): Strachey quadrant method.
 *
 * `size === 0`은 `out.length = 0`만 설정한다. `size === 1`은 `[[1]]`.
 *
 * @param out matrix를 기록할 writable storage. `[size, size]`에 맞는 capacity가 준비되어 있어야 한다.
 * @param size magic square의 한 변 길이. 비음의 safe integer. `2` 제외.
 */
export function magicSquareInto<Out extends MatWritable>(out: Out, size: number): Out {
  assertNonNegativeSafeInteger(size, 'size');
  if (size === 2) {
    throw new RangeError('magic square does not exist for size 2');
  }
  assertMatrixOutCapacity(out, size, size, 'out');
  if (size === 0) {
    out.length = 0;
    return out;
  }
  const computed = createZeroSquare(size);
  if (size === 1) {
    computed[0][0] = 1;
  } else if (size % 2 === 1) {
    fillSiamese(computed, size);
  } else if (size % 4 === 0) {
    fillDoublyEven(computed, size);
  } else {
    fillStrachey(computed, size);
  }
  for (let r = 0; r < size; r++) {
    const row = out[r];
    const src = computed[r];
    for (let c = 0; c < size; c++) {
      row[c] = src[c];
    }
    row.length = size;
  }
  out.length = size;
  return out;
}

function createZeroSquare(n: number): number[][] {
  const m: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = new Array(n);
    for (let j = 0; j < n; j++) {
      row[j] = 0;
    }
    m[i] = row;
  }
  return m;
}

// odd size n >= 1. target은 zero로 초기화되어 있어야 한다.
function fillSiamese(target: number[][], n: number): void {
  let row = 0;
  let col = (n - 1) >> 1;
  target[row][col] = 1;
  const total = n * n;
  for (let k = 2; k <= total; k++) {
    const nextRow = (row - 1 + n) % n;
    const nextCol = (col + 1) % n;
    if (target[nextRow][nextCol] !== 0) {
      row = (row + 1) % n;
    } else {
      row = nextRow;
      col = nextCol;
    }
    target[row][col] = k;
  }
}

// doubly-even size n (n % 4 === 0).
function fillDoublyEven(target: number[][], n: number): void {
  const total = n * n;
  for (let i = 0; i < n; i++) {
    const row = target[i];
    const im = i & 3;
    for (let j = 0; j < n; j++) {
      const jm = j & 3;
      const invert = im === jm || im + jm === 3;
      const value = i * n + j + 1;
      row[j] = invert ? total - value + 1 : value;
    }
  }
}

// singly-even size n (n % 4 === 2, n >= 6).
function fillStrachey(target: number[][], n: number): void {
  const m = n / 2;
  const k = (n - 2) / 4;
  const odd = createZeroSquare(m);
  fillSiamese(odd, m);
  const mSquared = m * m;
  // A (top-left), B (bottom-right), C (top-right), D (bottom-left).
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      const v = odd[i][j];
      target[i][j] = v;
      target[i + m][j + m] = v + mSquared;
      target[i][j + m] = v + 2 * mSquared;
      target[i + m][j] = v + 3 * mSquared;
    }
  }
  // 왼쪽 k 열을 A(top)와 D(bottom)에서 swap. middle row만 column 0 대신 column k를 swap한다.
  const middleRow = (m - 1) >> 1;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < k; j++) {
      const col = i === middleRow && j === 0 ? k : j;
      const tmp = target[i][col];
      target[i][col] = target[i + m][col];
      target[i + m][col] = tmp;
    }
  }
  // 오른쪽 k - 1 열을 C(top)와 B(bottom)에서 swap. middle row 예외 없음.
  for (let i = 0; i < m; i++) {
    for (let j = 0; j + 1 < k; j++) {
      const col = n - 1 - j;
      const tmp = target[i][col];
      target[i][col] = target[i + m][col];
      target[i + m][col] = tmp;
    }
  }
}
