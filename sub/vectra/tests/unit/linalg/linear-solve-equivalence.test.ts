/**
 * solveByGaussianElimination, luDecomposition, solveWithLuFactorization 동등성 단위 테스트.
 *
 * 속도를 위한 내부 변경이 결과를 바꾸지 않는지 고정한다. 변경 전 구현을 이 파일에 기준 구현으로 복사해 두고,
 * 무작위 입력에서 결과가 `-0`의 부호까지 같은지 비교한다. 입력은 정칙, 특이, 불일치, 과소결정, 과결정,
 * 희소, epsilon 경계 크기, `-0` 포함 matrix를 섞는다.
 *
 * 기준 구현은 변경 전 동작의 사본이다. src 구현을 고칠 때 이 사본은 고치지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { luDecomposition } from '../../../src/linalg/lu-decomposition';
import { solveByGaussianElimination } from '../../../src/linalg/solve-by-gaussian-elimination';
import { solveWithLuFactorization } from '../../../src/linalg/solve-with-lu-factorization';
import type { LinearSolveResult, LUFactorization } from '../../../src/linalg/types';

/**
 * seed 고정 선형 합동 난수. `[0, 1)`을 반환하는 함수를 만든다.
 *
 * 입력이 실행마다 같도록 `Math.random` 대신 쓴다.
 */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Kind = 'dense' | 'sparse' | 'tiny' | 'quarter' | 'negativeZero' | 'duplicateRow' | 'zeroRow' | 'zeroColumn';

const KINDS: readonly Kind[] = [
  'dense',
  'sparse',
  'tiny',
  'quarter',
  'negativeZero',
  'duplicateRow',
  'zeroRow',
  'zeroColumn',
];

/**
 * `kind` 성질을 가진 `rows x columns` matrix를 만든다.
 *
 * - `sparse`: entry 60%가 0이다. LU의 0 multiplier 분기를 지난다.
 * - `tiny`: entry 30%가 기본 epsilon(1e-9) 근처 크기다. cleanup 경계를 지난다.
 * - `quarter`: entry가 0.25 배수라 소거 결과가 정확히 0이 되는 일이 잦다.
 */
function makeMatrix(kind: Kind, rows: number, columns: number, rng: () => number): number[][] {
  const scales = [1, 1e-3, 1e3, 1e-8, 1e6];
  const scale = scales[Math.floor(rng() * scales.length)];
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => {
      const draw = rng();
      let value = (rng() * 2 - 1) * scale;
      if (kind === 'sparse' && draw < 0.6) value = 0;
      if (kind === 'tiny' && draw < 0.3) value = (rng() * 2 - 1) * 1e-9 * (rng() < 0.5 ? 1 : 3);
      if (kind === 'quarter') value = Math.round(value * 4) / 4;
      if (kind === 'negativeZero' && draw < 0.3) value = -0;
      return value;
    })
  );
  if (kind === 'sparse') {
    for (let i = 0; i < Math.min(rows, columns); i++) {
      if (rng() < 0.8) matrix[i][i] = (rng() * 2 - 1) * scale + 1;
    }
  }
  if (kind === 'duplicateRow' && rows > 1) matrix[rows - 1] = matrix[0].slice();
  if (kind === 'zeroRow') matrix[Math.floor(rng() * rows)] = new Array<number>(columns).fill(0);
  if (kind === 'zeroColumn') {
    const column = Math.floor(rng() * columns);
    for (const row of matrix) row[column] = 0;
  }
  return matrix;
}

/** 일관된 우변 `A * x`를 만든다. `perturb`이면 일부 값을 흔들어 불일치 시스템으로 만든다. */
function makeRhs(matrix: readonly (readonly number[])[], perturb: boolean, rng: () => number): number[] {
  const x = matrix[0].map(() => rng() * 4 - 2);
  const b = matrix.map((row) => row.reduce((sum, value, j) => sum + value * x[j], 0));
  return perturb ? b.map((value) => value + (rng() * 2 - 1)) : b;
}

// ---------------------------------------------------------------------------
// 기준 구현: 변경 전 동작의 사본
// ---------------------------------------------------------------------------

/**
 * 변경 전 `decomposeFiniteSquareMatrixLU`의 사본. 합쳐 쓰는 `temp` 한 장에서 소거한 뒤 L, U로 나눈다.
 */
function referenceLu(matrix: readonly (readonly number[])[], n: number, epsilon: number): LUFactorization | undefined {
  if (n === 0) return { lower: [], upper: [], permutation: [], swaps: 0 };
  const temp = matrix.map((row) => row.slice());
  const permutation = Array.from({ length: n }, (_, i) => i);
  let swaps = 0;
  for (let k = 0; k < n; k++) {
    let maxRow = k;
    let maxAbs = Math.abs(temp[k][k]);
    for (let r = k + 1; r < n; r++) {
      const a = Math.abs(temp[r][k]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) return undefined;
    if (maxRow !== k) {
      [temp[k], temp[maxRow]] = [temp[maxRow], temp[k]];
      [permutation[k], permutation[maxRow]] = [permutation[maxRow], permutation[k]];
      swaps++;
    }
    const pivot = temp[k][k];
    for (let i = k + 1; i < n; i++) {
      const factor = temp[i][k] / pivot;
      temp[i][k] = factor;
      for (let j = k + 1; j < n; j++) {
        const v = temp[i][j] - factor * temp[k][j];
        if (!Number.isFinite(v)) {
          throw new RangeError(`LU decomposition produced non-finite value at [${i}][${j}], got ${String(v)}`);
        }
        temp[i][j] = v;
      }
    }
  }
  const canonical = (v: number): number => (v === 0 ? 0 : v);
  const lower = temp.map((row, i) => row.map((v, j) => (j < i ? canonical(v) : j === i ? 1 : 0)));
  const upper = temp.map((row, i) => row.map((v, j) => (j >= i ? canonical(v) : 0)));
  return { lower, upper, permutation, swaps };
}

/**
 * 변경 전 `solveByGaussianElimination`의 사본. `[A | b]`를 partial pivoting Gauss-Jordan으로 소거해
 * 분류한다. 입력 검증은 생략한다(호출하는 쪽이 유한한 입력만 준다).
 */
function referenceSolve(A: readonly (readonly number[])[], b: readonly number[], epsilon: number): LinearSolveResult {
  const rows = A.length;
  if (rows === 0) return { type: 'unique', solution: [] };
  const columns = A[0].length;
  const total = columns + 1;
  const temp = A.map((row, r) => [...row, b[r]]);

  let pivotRow = 0;
  for (let c = 0; c < total && pivotRow < rows; c++) {
    let maxRow = pivotRow;
    let maxAbs = Math.abs(temp[pivotRow][c]);
    for (let r = pivotRow + 1; r < rows; r++) {
      const a = Math.abs(temp[r][c]);
      if (a > maxAbs) {
        maxAbs = a;
        maxRow = r;
      }
    }
    if (maxAbs <= epsilon) {
      for (let r = 0; r < rows; r++) {
        if (Math.abs(temp[r][c]) <= epsilon) temp[r][c] = 0;
      }
      continue;
    }
    if (maxRow !== pivotRow) [temp[pivotRow], temp[maxRow]] = [temp[maxRow], temp[pivotRow]];
    const pivotValue = temp[pivotRow][c];
    const pivotLine = temp[pivotRow];
    for (let cc = c; cc < total; cc++) {
      const v = pivotLine[cc] / pivotValue;
      if (!Number.isFinite(v)) {
        throw new RangeError(
          `matrix elimination produced non-finite pivot row entry at [${pivotRow}][${cc}], got ${String(v)}`
        );
      }
      pivotLine[cc] = Math.abs(v) <= epsilon ? 0 : v;
    }
    pivotLine[c] = 1;
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue;
      const line = temp[r];
      const factor = line[c];
      if (factor === 0) {
        line[c] = 0;
        continue;
      }
      for (let cc = c; cc < total; cc++) {
        const v = line[cc] - factor * pivotLine[cc];
        if (!Number.isFinite(v)) {
          throw new RangeError(`matrix elimination produced non-finite value at [${r}][${cc}], got ${String(v)}`);
        }
        line[cc] = Math.abs(v) <= epsilon ? 0 : v;
      }
      line[c] = 0;
    }
    pivotRow++;
  }

  const pivotColumns: number[] = [];
  const pivotRows: number[] = [];
  let inconsistent = false;
  for (let r = 0; r < rows; r++) {
    const pivotColumn = temp[r].slice(0, columns).findIndex((v) => Math.abs(v) > epsilon);
    if (pivotColumn === -1) {
      if (Math.abs(temp[r][columns]) > epsilon) inconsistent = true;
      continue;
    }
    pivotColumns.push(pivotColumn);
    pivotRows.push(r);
  }
  const canonicalTemp = temp.map((row) => row.map((v) => (v === 0 ? 0 : v)));
  if (inconsistent) return { type: 'inconsistent', rref: canonicalTemp };
  if (pivotColumns.length === columns) {
    const solution = new Array<number>(columns).fill(0);
    pivotColumns.forEach((pc, i) => {
      const v = temp[pivotRows[i]][columns];
      solution[pc] = v === 0 ? 0 : v;
    });
    if (rows > columns) {
      const errors = A.map((row, r) => row.reduce((sum, v, c) => sum + v * solution[c], -b[r]));
      const max = Math.max(...errors.map(Math.abs));
      const scaled = errors.reduce((sum, e) => sum + (e / max) * (e / max), 0);
      return { type: 'overdetermined', solution, residual: max === 0 ? 0 : max * Math.sqrt(scaled) };
    }
    return { type: 'unique', solution };
  }
  return { type: 'underdetermined', rref: canonicalTemp, pivotColumns };
}

/**
 * 호출 결과를 비교 가능한 값으로 만든다. 예외는 종류와 메시지로 바꾼다.
 */
function outcome(run: () => unknown): { value?: unknown; error?: string } {
  try {
    return { value: run() };
  } catch (error) {
    return { error: `${(error as Error).constructor.name}: ${(error as Error).message}` };
  }
}

/** 값을 `-0`까지 구분하는 문자열로 만든다. `toEqual`은 `+0`과 `-0`을 같게 본다. */
function bits(value: unknown): string {
  return JSON.stringify(value, (_key, v) => (Object.is(v, -0) ? '-0' : v));
}

// ---------------------------------------------------------------------------
// 동등성
// ---------------------------------------------------------------------------

describe('solveByGaussianElimination — 변경 전 구현과 같은 결과', () => {
  test('무작위 시스템 3000개에서 type, solution, rref, pivotColumns, residual이 비트 단위로 같다', () => {
    const rng = makeRng(20260101);
    const seen = new Set<string>();
    for (let k = 0; k < 3000; k++) {
      const kind = KINDS[k % KINDS.length];
      const columns = 1 + Math.floor(rng() * (k % 50 === 0 ? 30 : 8));
      const rows = rng() < 0.55 ? columns : Math.max(1, columns + Math.floor(rng() * 7) - 3);
      const A = makeMatrix(kind, rows, columns, rng);
      const b = makeRhs(A, rng() < 0.25, rng);
      const epsilon = [undefined, undefined, 0, 1e-12, 1e-3][Math.floor(rng() * 5)];
      const options = epsilon === undefined ? undefined : { epsilon };

      const actual = outcome(() => solveByGaussianElimination(A, b, options));
      const expected = outcome(() => referenceSolve(A, b, epsilon ?? 1e-9));
      expect(bits(actual), `kind=${kind} ${rows}x${columns} epsilon=${String(epsilon)}`).toBe(bits(expected));
      if (actual.value !== undefined) seen.add((actual.value as LinearSolveResult).type);
    }
    // 네 분류가 모두 나오는 입력 분포다. 한 분류가 사라지면 이 시험이 약해진 것이다.
    expect([...seen].sort()).toEqual(['inconsistent', 'overdetermined', 'underdetermined', 'unique']);
  });
});

describe('luDecomposition, solveWithLuFactorization — 변경 전 구현과 같은 결과', () => {
  test('무작위 정방 matrix 3000개에서 lower, upper, permutation, swaps가 비트 단위로 같다', () => {
    const rng = makeRng(20260102);
    let factored = 0;
    let singular = 0;
    for (let k = 0; k < 3000; k++) {
      const kind = KINDS[k % KINDS.length];
      const n = 1 + Math.floor(rng() * (k % 50 === 0 ? 40 : 9));
      const A = makeMatrix(kind, n, n, rng);
      const epsilon = [undefined, undefined, 0, 1e-12, 1e-3][Math.floor(rng() * 5)];
      const options = epsilon === undefined ? undefined : { epsilon };

      const actual = outcome(() => luDecomposition(A, options));
      const expected = outcome(() => referenceLu(A, n, epsilon ?? 1e-9));
      expect(bits(actual), `kind=${kind} n=${n} epsilon=${String(epsilon)}`).toBe(bits(expected));
      if (actual.value === undefined) {
        singular++;
        continue;
      }
      factored++;

      const b = makeRhs(A, false, rng);
      const solved = outcome(() => solveWithLuFactorization(actual.value as LUFactorization, b, options));
      const solvedAgain = outcome(() => solveWithLuFactorization(expected.value as LUFactorization, b, options));
      expect(bits(solved), `solve kind=${kind} n=${n}`).toBe(bits(solvedAgain));
    }
    expect(factored).toBeGreaterThan(500);
    expect(singular).toBeGreaterThan(500);
  });

  test('소거 중 overflow는 변경 전과 같은 RangeError를 던진다', () => {
    const A = [
      [1, 1e308, 0],
      [1, -1e308, 0],
      [0, 0, 1],
    ];
    const expected = outcome(() => referenceLu(A, 3, 1e-9));
    expect(expected.error).toMatch(/^RangeError: LU decomposition produced non-finite value at \[1\]\[1\]/);
    expect(bits(outcome(() => luDecomposition(A)))).toBe(bits(expected));
  });
});
