/**
 * ellipse-ellipse-solver.internal 단위 테스트.
 *
 * ellipse-ellipse-detail 분할로 추출된 다항식 실근 solver(solveQuarticReal/solveCubicReal/
 * solveQuadraticReal)에 직접 test가 없던 상태를 characterization golden으로 고정한다.
 * solver는 정렬·중복 제거 없이 raw root 배열을 반환하므로 test는 sort + toBeCloseTo로
 * distinct root set을 비교한다. eps는 dispatcher가 넘기는 solveEps=1e-12를 동일 사용한다.
 */
import { describe, expect, test } from 'vitest';
import {
  solveCubicReal,
  solveQuadraticReal,
  solveQuarticReal,
} from '../../../src/intersects/ellipse-ellipse-solver.internal';

const EPS = 1e-12;

/** raw root 배열을 오름차순 정렬해 golden과 toBeCloseTo로 비교한다. */
function expectRoots(actual: number[], expected: number[]): void {
  const sorted = [...actual].sort((a, b) => a - b);
  expect(sorted).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(sorted[i]).toBeCloseTo(expected[i] as number, 9);
  }
}

describe('solveQuadraticReal', () => {
  test('서로 다른 두 실근 — x²-5x+6 → {2, 3}', () => {
    expectRoots(solveQuadraticReal(1, -5, 6, EPS), [2, 3]);
  });

  test('중근 — x²-2x+1 → {1} (disc ≤ eps 1근)', () => {
    expectRoots(solveQuadraticReal(1, -2, 1, EPS), [1]);
  });

  test('실근 없음 — x²+1 → {} (disc < -eps)', () => {
    expectRoots(solveQuadraticReal(1, 0, 1, EPS), []);
  });

  test('a ≈ 0 → 1차 downgrade — 0·x²+2x-4 → {2}', () => {
    expectRoots(solveQuadraticReal(0, 2, -4, EPS), [2]);
  });

  test('a ≈ 0 그리고 b ≈ 0 → 근 없음', () => {
    expectRoots(solveQuadraticReal(0, 0, 5, EPS), []);
  });
});

describe('solveCubicReal', () => {
  test('서로 다른 세 실근 — (x-1)(x-2)(x-3) = x³-6x²+11x-6 → {1, 2, 3} (disc < -eps)', () => {
    expectRoots(solveCubicReal(1, -6, 11, -6, EPS), [1, 2, 3]);
  });

  test('실근 1개 — x³-1 → {1} (disc > eps)', () => {
    expectRoots(solveCubicReal(1, 0, 0, -1, EPS), [1]);
  });

  test('삼중근 — x³ → {0} (disc ≈ 0 중근, dedup 후 0)', () => {
    const sorted = [...solveCubicReal(1, 0, 0, 0, EPS)].sort((a, b) => a - b);
    for (const r of sorted) expect(r).toBeCloseTo(0, 9);
  });

  test('a ≈ 0 → 2차 downgrade — 0·x³+x²-5x+6 → {2, 3}', () => {
    expectRoots(solveCubicReal(0, 1, -5, 6, EPS), [2, 3]);
  });
});

describe('solveQuarticReal', () => {
  test('서로 다른 네 실근 — (x-1)(x-2)(x-3)(x-4) = x⁴-10x³+35x²-50x+24 → {1, 2, 3, 4}', () => {
    expectRoots(solveQuarticReal(1, -10, 35, -50, 24, EPS), [1, 2, 3, 4]);
  });

  test('biquadratic (q ≈ 0) — x⁴-5x²+4 → {-2, -1, 1, 2}', () => {
    expectRoots(solveQuarticReal(1, 0, -5, 0, 4, EPS), [-2, -1, 1, 2]);
  });

  test('c4 ≈ 0 → cubic downgrade — 0·x⁴+x³-6x²+11x-6 → {1, 2, 3}', () => {
    expectRoots(solveQuarticReal(0, 1, -6, 11, -6, EPS), [1, 2, 3]);
  });
});
