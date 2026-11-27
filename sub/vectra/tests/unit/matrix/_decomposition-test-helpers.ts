/**
 * 행렬 분해 결과의 합성과 성분 비교를 돕는다.
 */
import { expect } from 'vitest';
import { multiply } from '../../../src/matrix/multiply';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { scalingMatrixInto } from '../../../src/matrix/scaling-matrix-into';
import { translationMatrixInto } from '../../../src/matrix/translation-matrix-into';
import type { MatrixDecompositionWritable } from '../../../src/types';
import type { Matrix, MatrixWritable } from '../../../src/types/flat-shapes.internal';

/** 분해 결과를 기록할 시험 객체를 만든다. */
export function makeDecomp(): MatrixDecompositionWritable {
  return {
    translation: { x: 0, y: 0 },
    scaling: { x: 0, y: 0 },
    skewing: { x: 0, y: 0 },
    rotation: 0,
  };
}

/** 시험용 항등 행렬을 만든다. */
export function makeMatrix(): MatrixWritable {
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
}

/** 왕복 변환 검증을 위해 분해 결과를 다시 합성한다. */
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

/** 행렬의 여섯 성분을 오차 범위 안에서 비교한다. */
export function expectMatrixClose(actual: MatrixWritable, expected: Matrix, precision = 12): void {
  expect(actual.a).toBeCloseTo(expected.a, precision);
  expect(actual.b).toBeCloseTo(expected.b, precision);
  expect(actual.c).toBeCloseTo(expected.c, precision);
  expect(actual.d).toBeCloseTo(expected.d, precision);
  expect(actual.tx).toBeCloseTo(expected.tx, precision);
  expect(actual.ty).toBeCloseTo(expected.ty, precision);
}
