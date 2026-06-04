/**
 * Root entry linalg type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  CholeskyDecomposition,
  EigenDecomposition,
  IterationOptions,
  LinearSolveResult,
  LUFactorization,
  MatLike,
  MatrixExponentialOptions,
  MatrixShape,
  MatWritable,
  NormOptions,
  PivotOptions,
  QRDecomposition,
  QROptions,
  SingularValueDecomposition,
  SLogDetResult,
  SparseMatrixEntry,
  SparseOptions,
  SparseVectorEntry,
  VecLike,
  VecWritable,
} from '../../src/index';

function expectAssignable<T>(value: T): T {
  return value;
}

describe('root linalg type exposure 계약', () => {
  test('root entry가 vector/matrix base type을 노출한다', () => {
    expectAssignable<VecLike>([1, 2, 3] as const);
    expectAssignable<VecWritable>([0, 0, 0]);
    expectAssignable<MatLike>([
      [1, 2],
      [3, 4],
    ] as const);
    expectAssignable<MatWritable>([
      [0, 0],
      [0, 0],
    ]);
    expectAssignable<MatrixShape>([2, 3] as const);
  });

  test('root entry가 sparse/norm option type을 노출한다', () => {
    expectAssignable<SparseVectorEntry>({ index: 0, value: 1 });
    expectAssignable<SparseMatrixEntry>({ row: 0, column: 1, value: 2 });
    expectAssignable<NormOptions>({ p: 2 });
    expectAssignable<SparseOptions>({ epsilon: 0 });
    expectAssignable<PivotOptions>({ epsilon: 1e-9 });
  });

  test('root entry가 MatrixExponentialOptions type을 노출한다', () => {
    expectAssignable<MatrixExponentialOptions>({});
    expectAssignable<MatrixExponentialOptions>({
      maxTerms: 128,
      tolerance: 1e-14,
      scalingThreshold: 0.25,
    });
  });

  test('root entry가 decomposition type을 노출한다', () => {
    expectAssignable<CholeskyDecomposition>({ lower: [[1]] });
    expectAssignable<QROptions>({ epsilon: 1e-9 });
    expectAssignable<QRDecomposition>({ orthogonal: [[1]], upper: [[5]], rank: 1 });
    expectAssignable<LUFactorization>({
      lower: [[1]],
      upper: [[2]],
      permutation: [0],
      swaps: 0,
    });
    expectAssignable<EigenDecomposition>({
      values: [1, 2],
      vectors: [
        [1, 0],
        [0, 1],
      ],
    });
    expectAssignable<SingularValueDecomposition>({
      leftSingularVectors: [
        [1, 0],
        [0, 1],
      ],
      singularValues: [3, 1],
      rightSingularVectors: [
        [1, 0],
        [0, 1],
      ],
      rank: 2,
    });
  });

  test('root entry가 solve/iteration/result type을 노출한다', () => {
    expectAssignable<LinearSolveResult>({ type: 'unique', solution: [1, 2] } as const);
    expectAssignable<LinearSolveResult>({
      type: 'overdetermined',
      solution: [1, 2],
      residual: 0,
    } as const);
    expectAssignable<LinearSolveResult>({
      type: 'underdetermined',
      rref: [[1, 0, 2]],
      pivotColumns: [0],
    } as const);
    expectAssignable<LinearSolveResult>({
      type: 'inconsistent',
      rref: [[0, 0, 1]],
    } as const);
    expectAssignable<IterationOptions>({ maxIterations: 50, tolerance: 1e-12, epsilon: 1e-8 });
    expectAssignable<SLogDetResult>({ sign: 1, logAbsDet: Math.log(6) });
    expectAssignable<SLogDetResult>({ sign: -1, logAbsDet: 0 });
    expectAssignable<SLogDetResult>({ sign: 0, logAbsDet: Number.NEGATIVE_INFINITY });
  });
});
