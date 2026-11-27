/**
 * jacobiSymmetricEigenRaw — `tolerance > 0`에서 결과가 이전 구현과 비트 단위로 같은지 고정한다.
 *
 * 검증: 크기 2~24의 무작위 조밀 symmetric matrix, 대각·블록대각·이미 수렴한 matrix(비대각이 tolerance 이하),
 * 중복 eigenvalue matrix, 영 matrix, 여러 tolerance와 작은 maxIterations(수렴 실패)에서 `values`와
 * `vectors`가 이전 구현과 `Object.is` 수준으로 같다. 수렴 실패는 둘 다 `undefined`다.
 * `tolerance: 0`의 새 동작은 `tests/unit/linalg/eig-zero-tolerance.test.ts`가 고정한다.
 * 이전 구현도 Euclidean 길이를 `hypot2`로 구한다. `hypot2` 자체의 정밀도는 `tests/unit/internal/hypot2.test.ts`가 고정한다.
 */
import { describe, expect, test } from 'vitest';
import {
  type JacobiSymmetricEigenRawOptions,
  jacobiSymmetricEigenRaw,
} from '../../../src/internal/jacobi-symmetric-eigen';
import { hypot2 } from '../../../src/internal/numeric';
import { createRng } from '../../../src/random/create-rng';

// 이전 구현. `theta` 또는 분모가 overflow하면 던진다. 새 구현의 비교 기준으로만 쓴다.
interface JacobiSymmetricEigenRawResult {
  readonly values: number[];
  readonly vectors: number[][];
}

function legacyJacobiSymmetricEigenRaw(
  matrix: readonly (readonly number[])[],
  n: number,
  options: JacobiSymmetricEigenRawOptions
): JacobiSymmetricEigenRawResult | undefined {
  const { maxIterations, tolerance, errorPrefix } = options;

  const working = copySquareMatrix(matrix, n);
  const vectors = identityMatrix(n);

  for (let iter = 0; iter < maxIterations; iter++) {
    const pivot = findMaxOffDiagonal(working, n);
    if (pivot.maxAbs <= tolerance) {
      return { values: extractDiagonal(working, n), vectors };
    }

    const rotation = computeJacobiRotation(working, pivot.p, pivot.q, errorPrefix);
    applyRotationToWorking(working, n, pivot.p, pivot.q, rotation, errorPrefix);
    applyRotationToVectors(vectors, n, pivot.p, pivot.q, rotation);
  }

  return undefined;
}

function copySquareMatrix(matrix: readonly (readonly number[])[], n: number): number[][] {
  const working: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = matrix[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = src[c];
    }
    working[r] = row;
  }
  return working;
}

function identityMatrix(n: number): number[][] {
  const vectors: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = r === c ? 1 : 0;
    }
    vectors[r] = row;
  }
  return vectors;
}

interface OffDiagonalPivot {
  readonly p: number;
  readonly q: number;
  readonly maxAbs: number;
}

function findMaxOffDiagonal(working: readonly (readonly number[])[], n: number): OffDiagonalPivot {
  let p = 0;
  let q = 1;
  let maxAbs = 0;
  for (let i = 0; i < n - 1; i++) {
    const rowI = working[i];
    for (let j = i + 1; j < n; j++) {
      const abs = Math.abs(rowI[j]);
      if (abs > maxAbs) {
        maxAbs = abs;
        p = i;
        q = j;
      }
    }
  }
  return { p, q, maxAbs };
}

interface JacobiRotation {
  readonly c: number;
  readonly s: number;
}

function computeJacobiRotation(
  working: readonly (readonly number[])[],
  p: number,
  q: number,
  errorPrefix: string
): JacobiRotation {
  const app = working[p][p];
  const aqq = working[q][q];
  const apq = working[p][q];

  const theta = (aqq - app) / (2 * apq);
  if (!Number.isFinite(theta)) {
    throw new RangeError(`${errorPrefix} produced non-finite theta at (${p}, ${q}), got ${String(theta)}`);
  }
  const denomMag = Math.abs(theta) + hypot2(theta, 1);
  // denomMag >= 1이라 0이 될 수 없다. overflow만 확인한다.
  if (!Number.isFinite(denomMag)) {
    throw new RangeError(`${errorPrefix} produced non-finite denominator at (${p}, ${q}), got ${String(denomMag)}`);
  }
  const t = theta >= 0 ? 1 / denomMag : -1 / denomMag;
  const c = 1 / hypot2(t, 1);
  const s = t * c;
  return { c, s };
}

function applyRotationToWorking(
  working: number[][],
  n: number,
  p: number,
  q: number,
  rotation: JacobiRotation,
  errorPrefix: string
): void {
  const { c, s } = rotation;
  const app = working[p][p];
  const aqq = working[q][q];
  const apq = working[p][q];

  const newApp = c * c * app - 2 * s * c * apq + s * s * aqq;
  const newAqq = s * s * app + 2 * s * c * apq + c * c * aqq;
  if (!Number.isFinite(newApp) || !Number.isFinite(newAqq)) {
    throw new RangeError(
      `${errorPrefix} produced non-finite diagonal at (${p}, ${q}), got (${String(newApp)}, ${String(newAqq)})`
    );
  }
  working[p][p] = newApp;
  working[q][q] = newAqq;
  working[p][q] = 0;
  working[q][p] = 0;

  // 양방향 값을 같은 값으로 강제 대입해 rotation 이후에도 symmetry를 보존한다.
  for (let i = 0; i < n; i++) {
    if (i === p || i === q) continue;
    const aip = working[i][p];
    const aiq = working[i][q];
    const newAip = c * aip - s * aiq;
    const newAiq = s * aip + c * aiq;
    if (!Number.isFinite(newAip) || !Number.isFinite(newAiq)) {
      throw new RangeError(
        `${errorPrefix} produced non-finite off-diagonal at (${i}, ${p}/${q}), got (${String(newAip)}, ${String(newAiq)})`
      );
    }
    working[i][p] = newAip;
    working[p][i] = newAip;
    working[i][q] = newAiq;
    working[q][i] = newAiq;
  }
}

// eigenvector 행렬은 단위 행렬에서 시작해 직교 회전만 곱하므로 원소가 [-1, 1] 안이다. overflow하지 않는다.
function applyRotationToVectors(vectors: number[][], n: number, p: number, q: number, rotation: JacobiRotation): void {
  const { c, s } = rotation;
  for (let r = 0; r < n; r++) {
    const vRow = vectors[r];
    const vrp = vRow[p];
    const vrq = vRow[q];
    vRow[p] = c * vrp - s * vrq;
    vRow[q] = s * vrp + c * vrq;
  }
}

function extractDiagonal(working: readonly (readonly number[])[], n: number): number[] {
  const values = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    values[i] = working[i][i];
  }
  return values;
}

/** `[-1, 1)` 균등 난수로 채운 조밀 symmetric matrix. */
function randomSymmetric(n: number, rng: () => number): number[][] {
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const v = rng() * 2 - 1;
      m[i][j] = v;
      m[j][i] = v;
    }
  }
  return m;
}

/** 대각 블록 크기 목록으로 블록대각 matrix를 만든다. 블록 안은 무작위 symmetric이다. */
function blockDiagonal(blocks: readonly number[], rng: () => number): number[][] {
  const n = blocks.reduce((a, b) => a + b, 0);
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  let offset = 0;
  for (const size of blocks) {
    const block = randomSymmetric(size, rng);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        m[offset + i][offset + j] = block[i][j];
      }
    }
    offset += size;
  }
  return m;
}

/** 대각이 `diag`이고 비대각이 `±off`인 matrix. `off`가 tolerance 이하면 이미 수렴한 matrix다. */
function nearlyDiagonal(diag: readonly number[], off: number, rng: () => number): number[][] {
  const n = diag.length;
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    m[i][i] = diag[i];
    for (let j = i + 1; j < n; j++) {
      const v = (rng() < 0.5 ? -1 : 1) * off;
      m[i][j] = v;
      m[j][i] = v;
    }
  }
  return m;
}

/** 두 결과가 `Object.is`로 모든 entry에서 같은지 검증한다. 둘 다 `undefined`여도 같다. */
function expectBitIdentical(
  actual: JacobiSymmetricEigenRawResult | undefined,
  expected: JacobiSymmetricEigenRawResult | undefined
): void {
  if (expected === undefined) {
    expect(actual).toBeUndefined();
    return;
  }
  expect(actual).toBeDefined();
  const n = expected.values.length;
  expect(actual!.values.length).toBe(n);
  for (let i = 0; i < n; i++) {
    if (!Object.is(actual!.values[i], expected.values[i])) {
      throw new Error(`values[${i}]: ${actual!.values[i]} !== ${expected.values[i]}`);
    }
    for (let r = 0; r < n; r++) {
      if (!Object.is(actual!.vectors[r][i], expected.vectors[r][i])) {
        throw new Error(`vectors[${r}][${i}]: ${actual!.vectors[r][i]} !== ${expected.vectors[r][i]}`);
      }
    }
  }
}

function compare(matrix: number[][], options: JacobiSymmetricEigenRawOptions): void {
  const n = matrix.length;
  expectBitIdentical(jacobiSymmetricEigenRaw(matrix, n, options), legacyJacobiSymmetricEigenRaw(matrix, n, options));
}

const TOLERANCES = [1e-3, 1e-8, 1e-10, 1e-13] as const;

describe('jacobiSymmetricEigenRaw tolerance > 0 비트 동일', () => {
  test('무작위 조밀 symmetric matrix 결과가 이전 구현과 같다', () => {
    const rng = createRng('jacobi-equivalence-dense');
    for (let n = 2; n <= 24; n++) {
      for (let k = 0; k < 24; k++) {
        const m = randomSymmetric(n, rng);
        for (const tolerance of TOLERANCES) {
          compare(m, { maxIterations: 10 * n * n, tolerance, errorPrefix: 'equivalence' });
        }
      }
    }
  });

  test('블록대각 matrix 결과가 이전 구현과 같다', () => {
    const rng = createRng('jacobi-equivalence-block');
    const layouts = [
      [1, 1],
      [2, 1],
      [1, 3],
      [2, 2],
      [3, 3],
      [2, 4, 1],
      [1, 1, 1, 1],
      [5, 3],
    ];
    for (const blocks of layouts) {
      for (let k = 0; k < 4; k++) {
        const m = blockDiagonal(blocks, rng);
        const n = m.length;
        for (const tolerance of TOLERANCES) {
          compare(m, { maxIterations: 10 * n * n, tolerance, errorPrefix: 'equivalence' });
        }
      }
    }
  });

  test('대각 matrix와 이미 수렴한 matrix 결과가 이전 구현과 같다', () => {
    const rng = createRng('jacobi-equivalence-converged');
    for (let n = 2; n <= 10; n++) {
      const diag = Array.from({ length: n }, () => rng() * 10 - 5);
      for (const tolerance of TOLERANCES) {
        compare(nearlyDiagonal(diag, 0, rng), { maxIterations: 100, tolerance, errorPrefix: 'equivalence' });
        compare(nearlyDiagonal(diag, tolerance, rng), { maxIterations: 100, tolerance, errorPrefix: 'equivalence' });
        compare(nearlyDiagonal(diag, tolerance * 4, rng), {
          maxIterations: 100,
          tolerance,
          errorPrefix: 'equivalence',
        });
      }
    }
  });

  test('중복 eigenvalue matrix와 영 matrix 결과가 이전 구현과 같다', () => {
    for (let n = 2; n <= 8; n++) {
      const zero = Array.from({ length: n }, () => new Array<number>(n).fill(0));
      const ones = Array.from({ length: n }, () => new Array<number>(n).fill(1));
      const identity = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
      for (const tolerance of TOLERANCES) {
        for (const m of [zero, ones, identity]) {
          compare(m, { maxIterations: 100, tolerance, errorPrefix: 'equivalence' });
        }
      }
    }
  });

  test('maxIterations가 작아 수렴하지 못해도 이전 구현과 같다', () => {
    const rng = createRng('jacobi-equivalence-budget');
    for (let n = 2; n <= 10; n++) {
      const m = randomSymmetric(n, rng);
      for (const maxIterations of [1, 2, 3, n, 2 * n, n * n]) {
        compare(m, { maxIterations, tolerance: 1e-10, errorPrefix: 'equivalence' });
      }
    }
  });
});
