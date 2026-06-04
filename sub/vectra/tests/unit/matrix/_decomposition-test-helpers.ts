import { expect } from 'vitest';
import { multiply } from '../../../src/matrix/multiply';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { scalingMatrixInto } from '../../../src/matrix/scaling-matrix-into';
import { translationMatrixInto } from '../../../src/matrix/translation-matrix-into';
import type {
  MatrixDecompositionWritable,
  MatrixLike,
  MatrixObjectLike,
  MatrixTuple,
  MatrixWritable,
} from '../../../src/types';

function isMatrixTuple(matrix: MatrixLike): matrix is MatrixTuple {
  return Array.isArray(matrix);
}

export function makeDecomp(): MatrixDecompositionWritable {
  return {
    translation: { x: 0, y: 0 },
    scaling: { x: 0, y: 0 },
    skewing: { x: 0, y: 0 },
    rotation: 0,
  };
}

export function makeMatrix(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

// matrix를 분해 결과로부터 다시 구성한다. round-trip 검증용.
export function compose(decomp: MatrixDecompositionWritable): MatrixWritable {
  const T = makeMatrix();
  translationMatrixInto(T, decomp.translation);
  const R = makeMatrix();
  rotationMatrixInto(R, decomp.rotation);
  const S = makeMatrix();
  scalingMatrixInto(S, decomp.scaling.x, decomp.scaling.y);
  // K = [[1, tan(skewX)], [0, 1]] (column-major: a=1, b=0, c=tan(skewX), d=1)
  const K: MatrixWritable = {
    a: 1,
    b: 0,
    c: Math.tan(decomp.skewing.x),
    d: 1,
    tx: 0,
    ty: 0,
  };
  // M = T * R * S * K
  const RS = multiply(R, S);
  const RSK = multiply(RS, K);
  return multiply(T, RSK);
}

function toMatrixObject(matrix: MatrixLike): MatrixObjectLike {
  if (isMatrixTuple(matrix)) {
    return { a: matrix[0], b: matrix[1], c: matrix[2], d: matrix[3], tx: matrix[4], ty: matrix[5] };
  }
  return matrix;
}

export function expectMatrixClose(actual: MatrixWritable, expected: MatrixLike, precision = 12): void {
  const e = toMatrixObject(expected);
  expect(actual.a).toBeCloseTo(e.a, precision);
  expect(actual.b).toBeCloseTo(e.b, precision);
  expect(actual.c).toBeCloseTo(e.c, precision);
  expect(actual.d).toBeCloseTo(e.d, precision);
  expect(actual.tx).toBeCloseTo(e.tx, precision);
  expect(actual.ty).toBeCloseTo(e.ty, precision);
}
