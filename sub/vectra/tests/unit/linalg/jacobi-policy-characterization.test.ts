/**
 * 반복 옵션 검증과 부호 규약의 현재 출력을 고정하는 characterization test.
 *
 * 임시 안전망이다. 옵션 resolver 통합과 sign helper 추출이 출력을 바꾸지 않는지 확인한다.
 * 옵션은 eig, calculateEigenvalues, singularValueDecomposition, nullSpaceInto, pca, reduceDimensionsInto로 고정한다.
 * 부호는 eig, singularValueDecomposition, columnSpace, pseudoInverse, eigenvectorForEigenvalue, pca로 고정한다.
 * 숫자는 -0을 `-0`으로 구분해 적고, 오류는 class 이름과 메시지 전문을 적는다.
 */

import { describe, expect, test } from 'vitest';
import { calculateEigenvalues } from '../../../src/linalg/calculate-eigenvalues';
import { columnSpace } from '../../../src/linalg/column-space';
import { eig } from '../../../src/linalg/eig';
import { eigenvectorForEigenvalue } from '../../../src/linalg/eigenvector-for-eigenvalue';
import { nullSpaceInto } from '../../../src/linalg/null-space-into';
import { pseudoInverse } from '../../../src/linalg/pseudo-inverse';
import { singularValueDecomposition } from '../../../src/linalg/singular-value-decomposition';
import { solveUnderdeterminedSystem } from '../../../src/linalg/solve-underdetermined-system';
import { pca } from '../../../src/statistics/pca';
import { reduceDimensionsInto } from '../../../src/statistics/reduce-dimensions-into';

type Matrix = readonly (readonly number[])[];

/**
 * 값을 -0까지 구분하는 한 줄 문자열로 바꾼다.
 *
 * 배열과 plain object는 재귀로 펼친다. snapshot에서 부호 없는 0과 -0을 구별하려고 쓴다.
 */
function format(value: unknown): string {
  if (typeof value === 'number') {
    return Object.is(value, -0) ? '-0' : String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(format).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).map(([key, item]) => `${key}: ${format(item)}`);
    return `{${entries.join(', ')}}`;
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * 함수를 실행해 결과 또는 오류를 한 줄 문자열로 만든다.
 *
 * 오류는 class 이름과 메시지 전문을 남긴다. 어떤 검증이 먼저 throw하는지 snapshot으로 비교하려고 쓴다.
 */
function run(fn: () => unknown): string {
  try {
    return format(fn());
  } catch (error) {
    const e = error as Error;
    return `throws ${e.constructor.name}: ${e.message}`;
  }
}

/**
 * 라벨별 호출을 모두 실행해 `라벨 => 결과` 줄로 묶는다.
 *
 * 한 test가 여러 입력을 하나의 inline snapshot으로 고정할 때 쓴다.
 */
function table(cases: Readonly<Record<string, () => unknown>>): string {
  return Object.entries(cases)
    .map(([label, fn]) => `${label} => ${run(fn)}`)
    .join('\n');
}

/** 옵션 필드 하나에 넣어 보는 경계값과 타입 위반 값. 문자열 라벨은 snapshot 줄 이름이 된다. */
const FIELD_VALUES: Readonly<Record<string, unknown>> = {
  undefined: undefined,
  null: null,
  '0': 0,
  '-0': -0,
  '-1': -1,
  '1': 1,
  '1.5': 1.5,
  '5': 5,
  '1e-3': 1e-3,
  '1e-12': 1e-12,
  '1e6': 1e6,
  NaN: Number.NaN,
  Infinity: Number.POSITIVE_INFINITY,
  '-Infinity': Number.NEGATIVE_INFINITY,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  'MAX_SAFE_INTEGER+1': Number.MAX_SAFE_INTEGER + 1,
  '문자열 5': '5',
  true: true,
  '빈 객체': {},
  '빈 배열': [],
};

/**
 * 필드 하나에 `FIELD_VALUES`를 하나씩 넣어 `call`을 실행하는 case 묶음을 만든다.
 *
 * `field`만 바뀌고 나머지 옵션은 비워 둔다. 각 필드 검증을 독립으로 고정할 때 쓴다.
 */
function fieldCases(field: string, call: (options: never) => unknown): Record<string, () => unknown> {
  const cases: Record<string, () => unknown> = {};
  for (const [label, value] of Object.entries(FIELD_VALUES)) {
    cases[`${field}=${label}`] = () => call({ [field]: value } as never);
  }
  return cases;
}

/**
 * 세 필드에 서로 구별되는 위반 값을 넣고, 부분집합마다 어느 오류가 먼저 나는지 보는 case 묶음을 만든다.
 *
 * `extra`는 모든 case에 함께 넣는 옵션이다. PCA의 useCorrelation 위반을 겹칠 때 쓴다.
 */
function combinationCases(
  call: (options: never) => unknown,
  extra: Readonly<Record<string, unknown>> = {}
): Record<string, () => unknown> {
  const bad = { maxIterations: 0, tolerance: -1, epsilon: Number.NaN } as const;
  const names = ['maxIterations', 'tolerance', 'epsilon'] as const;
  const cases: Record<string, () => unknown> = {};
  for (let mask = 1; mask < 8; mask++) {
    const options: Record<string, unknown> = { ...extra };
    const label: string[] = Object.keys(extra);
    names.forEach((name, i) => {
      if (mask & (1 << i)) {
        options[name] = bad[name];
        label.push(name);
      }
    });
    cases[label.join('+')] = () => call(options as never);
  }
  return cases;
}

const SYMMETRIC_3X3: Matrix = [
  [4, 1, 0],
  [1, 3, 1],
  [0, 1, 2],
];
const PCA_DATA: Matrix = [
  [1, 2],
  [2, 1],
  [3, 5],
  [4, 3],
];

describe('반복 옵션 검증 characterization', () => {
  test('eig는 maxIterations 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('maxIterations', (o) => eig(SYMMETRIC_3X3, o)))).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => undefined
      maxIterations=5 => undefined
      maxIterations=undefined => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got "
    `);
  });

  test('eig는 tolerance 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('tolerance', (o) => eig(SYMMETRIC_3X3, o)))).toMatchInlineSnapshot(`
      "tolerance=0 => throws RangeError: Jacobi rotation produced non-finite theta at (0, 1), got -Infinity
      tolerance=1 => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=5 => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=undefined => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => throws RangeError: Jacobi rotation produced non-finite theta at (0, 1), got -Infinity
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=1e-3 => {values: [4.732050790182783, 3.000000017386009, 1.2679491924312078], vectors: [[0.7887329748696741, 0.5772712964184532, 0.21132473751218114], [0.5772924220547131, -0.5774082384245061, -0.5773501412814515], [0.21126702012249088, -0.5773712640328295, 0.7886752624988917]]}
      tolerance=1e-12 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345948128, 0.5773502691896258, 0.2113248654051871], [0.5773502691896257, -0.5773502691896257, -0.5773502691896261], [0.21132486540518725, -0.5773502691896261, 0.7886751345948128]]}
      tolerance=1e6 => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=MAX_SAFE_INTEGER+1 => {values: [4, 3, 2], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got "
    `);
  });

  test('eig는 epsilon 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('epsilon', (o) => eig(SYMMETRIC_3X3, o)))).toMatchInlineSnapshot(`
      "epsilon=0 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      epsilon=1 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=5 => {values: [0, 0, 0], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=undefined => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => {values: [4.732050807568875, 3.000000000000002, 0], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=1e-3 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      epsilon=1e-12 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      epsilon=1e6 => {values: [0, 0, 0], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => {values: [0, 0, 0], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=MAX_SAFE_INTEGER+1 => {values: [0, 0, 0], vectors: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]}
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got "
    `);
  });

  test('eig는 옵션이 여러 개 틀리면 어느 오류가 먼저 나는지 고정한다', () => {
    expect(table(combinationCases((o) => eig(SYMMETRIC_3X3, o)))).toMatchInlineSnapshot(`
      "maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0"
    `);
  });

  test('eig는 옵션 오류를 matrix 오류보다 먼저 던진다', () => {
    expect(
      table({
        '옵션 오류와 matrix 오류': () => eig([[1, 2, 3]], { maxIterations: 0 }),
        'matrix 오류만': () => eig([[1, 2, 3]]),
        'options가 undefined': () => eig(SYMMETRIC_3X3, undefined),
        'options가 빈 객체': () => eig(SYMMETRIC_3X3, {}),
      })
    ).toMatchInlineSnapshot(`
      "옵션 오류와 matrix 오류 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      matrix 오류만 => throws RangeError: eig requires a square matrix, got shape [1, 3]
      options가 undefined => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      options가 빈 객체 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}"
    `);
  });

  test('calculateEigenvalues는 세 필드 검증을 같은 메시지로 던진다', () => {
    expect(
      table({
        ...fieldCases('maxIterations', (o) => calculateEigenvalues(SYMMETRIC_3X3, o)),
        ...fieldCases('tolerance', (o) => calculateEigenvalues(SYMMETRIC_3X3, o)),
        ...fieldCases('epsilon', (o) => calculateEigenvalues(SYMMETRIC_3X3, o)),
        ...combinationCases((o) => calculateEigenvalues(SYMMETRIC_3X3, o)),
      })
    ).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => undefined
      maxIterations=5 => undefined
      maxIterations=undefined => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got 
      tolerance=0 => throws RangeError: Jacobi rotation produced non-finite theta at (0, 1), got -Infinity
      tolerance=1 => [4, 3, 2]
      tolerance=5 => [4, 3, 2]
      tolerance=undefined => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => throws RangeError: Jacobi rotation produced non-finite theta at (0, 1), got -Infinity
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => [4, 3, 2]
      tolerance=1e-3 => [4.732050790182783, 3.000000017386009, 1.2679491924312078]
      tolerance=1e-12 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      tolerance=1e6 => [4, 3, 2]
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => [4, 3, 2]
      tolerance=MAX_SAFE_INTEGER+1 => [4, 3, 2]
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got 
      epsilon=0 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=1 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=5 => [0, 0, 0]
      epsilon=undefined => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => [4.732050807568875, 3.000000000000002, 0]
      epsilon=1e-3 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=1e-12 => [4.732050807568875, 3.000000000000002, 1.267949192431123]
      epsilon=1e6 => [0, 0, 0]
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => [0, 0, 0]
      epsilon=MAX_SAFE_INTEGER+1 => [0, 0, 0]
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got 
      maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0"
    `);
  });

  test('singularValueDecomposition은 세 필드 검증을 같은 메시지로 던진다', () => {
    const matrix: Matrix = [
      [3, 1],
      [1, 2],
      [0, 1],
    ];
    expect(
      table({
        ...fieldCases('maxIterations', (o) => singularValueDecomposition(matrix, o)),
        ...fieldCases('tolerance', (o) => singularValueDecomposition(matrix, o)),
        ...fieldCases('epsilon', (o) => singularValueDecomposition(matrix, o)),
        ...combinationCases((o) => singularValueDecomposition(matrix, o)),
      })
    ).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => undefined
      maxIterations=5 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      maxIterations=undefined => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got 
      tolerance=0 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=1 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=5 => {leftSingularVectors: [[0.9486832980505138, 0.4082482904638631], [0.31622776601683794, 0.8164965809277261], [0, 0.4082482904638631]], singularValues: [3.1622776601683795, 2.449489742783178], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      tolerance=undefined => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=1e-3 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=1e-12 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      tolerance=1e6 => {leftSingularVectors: [[0.9486832980505138, 0.4082482904638631], [0.31622776601683794, 0.8164965809277261], [0, 0.4082482904638631]], singularValues: [3.1622776601683795, 2.449489742783178], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => {leftSingularVectors: [[0.9486832980505138, 0.4082482904638631], [0.31622776601683794, 0.8164965809277261], [0, 0.4082482904638631]], singularValues: [3.1622776601683795, 2.449489742783178], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      tolerance=MAX_SAFE_INTEGER+1 => {leftSingularVectors: [[0.9486832980505138, 0.4082482904638631], [0.31622776601683794, 0.8164965809277261], [0, 0.4082482904638631]], singularValues: [3.1622776601683795, 2.449489742783178], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got 
      epsilon=0 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      epsilon=1 => {leftSingularVectors: [[0, 0], [0, 0], [0, 0]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0, 0], [0, 0]], rank: 2}
      epsilon=5 => {leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0}
      epsilon=undefined => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => {leftSingularVectors: [[0, 0], [0, 0], [0, 0]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0, 0], [0, 0]], rank: 2}
      epsilon=1e-3 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      epsilon=1e-12 => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      epsilon=1e6 => {leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0}
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => {leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0}
      epsilon=MAX_SAFE_INTEGER+1 => {leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0}
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got 
      maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0"
    `);
  });

  test('nullSpaceInto는 resolver 오류를 같은 메시지로 던진다', () => {
    const matrix: Matrix = [
      [1, 2],
      [2, 4],
    ];
    expect(
      table({
        ...fieldCases('maxIterations', (o) => nullSpaceInto([] as number[][], matrix, o)),
        ...fieldCases('tolerance', (o) => nullSpaceInto([] as number[][], matrix, o)),
        ...fieldCases('epsilon', (o) => nullSpaceInto([] as number[][], matrix, o)),
        ...combinationCases((o) => nullSpaceInto([] as number[][], matrix, o)),
      })
    ).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => throws RangeError: out row count (0) is less than required rows (1)
      maxIterations=5 => throws RangeError: out row count (0) is less than required rows (1)
      maxIterations=undefined => throws RangeError: out row count (0) is less than required rows (1)
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => throws RangeError: out row count (0) is less than required rows (1)
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => throws RangeError: out row count (0) is less than required rows (1)
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got 
      tolerance=0 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=1 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=5 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=undefined => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=1e-3 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=1e-12 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=1e6 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=MAX_SAFE_INTEGER+1 => throws RangeError: out row count (0) is less than required rows (1)
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got 
      epsilon=0 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=1 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=5 => throws RangeError: out row count (0) is less than required rows (2)
      epsilon=undefined => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=1e-3 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=1e-12 => throws RangeError: out row count (0) is less than required rows (1)
      epsilon=1e6 => throws RangeError: out row count (0) is less than required rows (2)
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => throws RangeError: out row count (0) is less than required rows (2)
      epsilon=MAX_SAFE_INTEGER+1 => throws RangeError: out row count (0) is less than required rows (2)
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got 
      maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0"
    `);
  });

  test('pca는 maxIterations 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('maxIterations', (o) => pca(PCA_DATA, o)))).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => undefined
      maxIterations=5 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      maxIterations=undefined => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got "
    `);
  });

  test('pca는 tolerance 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('tolerance', (o) => pca(PCA_DATA, o)))).toMatchInlineSnapshot(`
      "tolerance=0 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=1 => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=5 => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=undefined => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=1e-3 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=1e-12 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=1e6 => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=MAX_SAFE_INTEGER+1 => {components: [[0, 1], [1, 0]], explainedVariance: [2.1875, 1.25], explainedVarianceRatio: [0.6363636363636364, 0.36363636363636365], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got "
    `);
  });

  test('pca는 epsilon 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('epsilon', (o) => pca(PCA_DATA, o)))).toMatchInlineSnapshot(`
      "epsilon=0 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      epsilon=1 => {components: [[0, 0]], explainedVariance: [2.711398760891787], explainedVarianceRatio: [1], means: [2.5, 2.75], standardDeviations: undefined, rank: 1}
      epsilon=5 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [2.5, 2.75], standardDeviations: undefined, rank: 0}
      epsilon=undefined => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => {components: [[0, 0]], explainedVariance: [2.711398760891787], explainedVarianceRatio: [1], means: [2.5, 2.75], standardDeviations: undefined, rank: 1}
      epsilon=1e-3 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      epsilon=1e-12 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      epsilon=1e6 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [2.5, 2.75], standardDeviations: undefined, rank: 0}
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [2.5, 2.75], standardDeviations: undefined, rank: 0}
      epsilon=MAX_SAFE_INTEGER+1 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [2.5, 2.75], standardDeviations: undefined, rank: 0}
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got "
    `);
  });

  test('pca는 useCorrelation 값별 결과와 오류를 고정한다', () => {
    expect(table(fieldCases('useCorrelation', (o) => pca(PCA_DATA, o)))).toMatchInlineSnapshot(`
      "useCorrelation=0 => throws RangeError: options.useCorrelation must be a boolean, got 0
      useCorrelation=1 => throws RangeError: options.useCorrelation must be a boolean, got 1
      useCorrelation=5 => throws RangeError: options.useCorrelation must be a boolean, got 5
      useCorrelation=undefined => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      useCorrelation=null => throws RangeError: options.useCorrelation must be a boolean, got null
      useCorrelation=-0 => throws RangeError: options.useCorrelation must be a boolean, got 0
      useCorrelation=-1 => throws RangeError: options.useCorrelation must be a boolean, got -1
      useCorrelation=1.5 => throws RangeError: options.useCorrelation must be a boolean, got 1.5
      useCorrelation=1e-3 => throws RangeError: options.useCorrelation must be a boolean, got 0.001
      useCorrelation=1e-12 => throws RangeError: options.useCorrelation must be a boolean, got 1e-12
      useCorrelation=1e6 => throws RangeError: options.useCorrelation must be a boolean, got 1000000
      useCorrelation=NaN => throws RangeError: options.useCorrelation must be a boolean, got NaN
      useCorrelation=Infinity => throws RangeError: options.useCorrelation must be a boolean, got Infinity
      useCorrelation=-Infinity => throws RangeError: options.useCorrelation must be a boolean, got -Infinity
      useCorrelation=MAX_SAFE_INTEGER => throws RangeError: options.useCorrelation must be a boolean, got 9007199254740991
      useCorrelation=MAX_SAFE_INTEGER+1 => throws RangeError: options.useCorrelation must be a boolean, got 9007199254740992
      useCorrelation=문자열 5 => throws RangeError: options.useCorrelation must be a boolean, got 5
      useCorrelation=true => {components: [[0.7071067811865475, 0.7071067811865475], [0.7071067811865475, -0.7071067811865475]], explainedVariance: [1.5291502622129176, 0.47084973778708183], explainedVarianceRatio: [0.764575131106459, 0.23542486889354097], means: [2.5, 2.75], standardDeviations: [1.118033988749895, 1.479019945774904], rank: 2}
      useCorrelation=빈 객체 => throws RangeError: options.useCorrelation must be a boolean, got [object Object]
      useCorrelation=빈 배열 => throws RangeError: options.useCorrelation must be a boolean, got "
    `);
  });

  test('pca는 필드 여러 개가 틀리면 어느 오류가 먼저 나는지 고정한다', () => {
    expect(table(combinationCases((o) => pca(PCA_DATA, o)))).toMatchInlineSnapshot(`
      "maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0"
    `);
  });

  test('pca는 useCorrelation 위반을 필드 위반보다 먼저 던진다', () => {
    expect(table(combinationCases((o) => pca(PCA_DATA, o), { useCorrelation: 'yes' }))).toMatchInlineSnapshot(`
      "useCorrelation+maxIterations => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+tolerance => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+maxIterations+tolerance => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+maxIterations+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+tolerance+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      useCorrelation+maxIterations+tolerance+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes"
    `);
  });

  test('pca는 orientation, mode, data 검증과 옵션 검증의 순서를 고정한다', () => {
    expect(
      table({
        'orientation 위반 + useCorrelation 위반': () =>
          pca(PCA_DATA, { orientation: 'diagonal', useCorrelation: 'yes' } as never),
        'mode 위반 + maxIterations 위반': () => pca(PCA_DATA, { mode: 'median', maxIterations: 0 } as never),
        'useCorrelation 위반 + data 위반': () => pca([[1, 2], [3]], { useCorrelation: 1 } as never),
        'maxIterations 위반 + data 위반': () => pca([[1, 2], [3]], { maxIterations: 0 }),
        'data 위반만': () => pca([[1, 2], [3]]),
        'options가 undefined': () => pca(PCA_DATA, undefined),
        'options가 빈 객체': () => pca(PCA_DATA, {}),
      })
    ).toMatchInlineSnapshot(`
      "orientation 위반 + useCorrelation 위반 => throws RangeError: options.orientation must be "columns" | "rows", got diagonal
      mode 위반 + maxIterations 위반 => throws RangeError: options.mode must be "population" | "sample", got median
      useCorrelation 위반 + data 위반 => throws RangeError: options.useCorrelation must be a boolean, got 1
      maxIterations 위반 + data 위반 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      data 위반만 => throws RangeError: data must be rectangular: data[1].length (1) !== data[0].length (2)
      options가 undefined => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      options가 빈 객체 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}"
    `);
  });

  test('reduceDimensionsInto는 세 필드와 useCorrelation 검증을 pca와 같은 메시지로 던진다', () => {
    const reduce = (o: never) => reduceDimensionsInto([], PCA_DATA, { dimensions: 1, ...(o as object) });
    expect(
      table({
        ...fieldCases('maxIterations', reduce),
        ...fieldCases('tolerance', reduce),
        ...fieldCases('epsilon', reduce),
        ...fieldCases('useCorrelation', reduce),
        ...combinationCases(reduce),
        ...Object.fromEntries(
          Object.entries(combinationCases(reduce, { useCorrelation: 'yes' })).map(([k, fn]) => [`R ${k}`, fn])
        ),
        'dimensions 위반 + useCorrelation 위반': () =>
          reduceDimensionsInto([], PCA_DATA, { dimensions: 0, useCorrelation: 'yes' } as never),
      })
    ).toMatchInlineSnapshot(`
      "maxIterations=0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=1 => throws RangeError: reduceDimensions could not project: PCA decomposition failed to converge within options.maxIterations
      maxIterations=5 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      maxIterations=undefined => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      maxIterations=null => throws RangeError: options.maxIterations must be a positive safe integer, got null
      maxIterations=-0 => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      maxIterations=-1 => throws RangeError: options.maxIterations must be a positive safe integer, got -1
      maxIterations=1.5 => throws RangeError: options.maxIterations must be a positive safe integer, got 1.5
      maxIterations=1e-3 => throws RangeError: options.maxIterations must be a positive safe integer, got 0.001
      maxIterations=1e-12 => throws RangeError: options.maxIterations must be a positive safe integer, got 1e-12
      maxIterations=1e6 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      maxIterations=NaN => throws RangeError: options.maxIterations must be a positive safe integer, got NaN
      maxIterations=Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got Infinity
      maxIterations=-Infinity => throws RangeError: options.maxIterations must be a positive safe integer, got -Infinity
      maxIterations=MAX_SAFE_INTEGER => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      maxIterations=MAX_SAFE_INTEGER+1 => throws RangeError: options.maxIterations must be a positive safe integer, got 9007199254740992
      maxIterations=문자열 5 => throws RangeError: options.maxIterations must be a positive safe integer, got 5
      maxIterations=true => throws RangeError: options.maxIterations must be a positive safe integer, got true
      maxIterations=빈 객체 => throws RangeError: options.maxIterations must be a positive safe integer, got [object Object]
      maxIterations=빈 배열 => throws RangeError: options.maxIterations must be a positive safe integer, got 
      tolerance=0 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      tolerance=1 => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=5 => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=undefined => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      tolerance=null => throws RangeError: options.tolerance must be a finite number >= 0, got null
      tolerance=-0 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      tolerance=-1 => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      tolerance=1.5 => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=1e-3 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      tolerance=1e-12 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      tolerance=1e6 => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=NaN => throws RangeError: options.tolerance must be a finite number >= 0, got NaN
      tolerance=Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got Infinity
      tolerance=-Infinity => throws RangeError: options.tolerance must be a finite number >= 0, got -Infinity
      tolerance=MAX_SAFE_INTEGER => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=MAX_SAFE_INTEGER+1 => [[-0.75], [-1.75], [2.25], [0.25]]
      tolerance=문자열 5 => throws RangeError: options.tolerance must be a finite number >= 0, got 5
      tolerance=true => throws RangeError: options.tolerance must be a finite number >= 0, got true
      tolerance=빈 객체 => throws RangeError: options.tolerance must be a finite number >= 0, got [object Object]
      tolerance=빈 배열 => throws RangeError: options.tolerance must be a finite number >= 0, got 
      epsilon=0 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      epsilon=1 => [[0], [0], [0], [0]]
      epsilon=5 => throws RangeError: options.dimensions (1) exceeds PCA rank (0)
      epsilon=undefined => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      epsilon=null => throws RangeError: options.epsilon must be a finite number >= 0, got null
      epsilon=-0 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      epsilon=-1 => throws RangeError: options.epsilon must be a finite number >= 0, got -1
      epsilon=1.5 => [[0], [0], [0], [0]]
      epsilon=1e-3 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      epsilon=1e-12 => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      epsilon=1e6 => throws RangeError: options.dimensions (1) exceeds PCA rank (0)
      epsilon=NaN => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      epsilon=Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got Infinity
      epsilon=-Infinity => throws RangeError: options.epsilon must be a finite number >= 0, got -Infinity
      epsilon=MAX_SAFE_INTEGER => throws RangeError: options.dimensions (1) exceeds PCA rank (0)
      epsilon=MAX_SAFE_INTEGER+1 => throws RangeError: options.dimensions (1) exceeds PCA rank (0)
      epsilon=문자열 5 => throws RangeError: options.epsilon must be a finite number >= 0, got 5
      epsilon=true => throws RangeError: options.epsilon must be a finite number >= 0, got true
      epsilon=빈 객체 => throws RangeError: options.epsilon must be a finite number >= 0, got [object Object]
      epsilon=빈 배열 => throws RangeError: options.epsilon must be a finite number >= 0, got 
      useCorrelation=0 => throws RangeError: options.useCorrelation must be a boolean, got 0
      useCorrelation=1 => throws RangeError: options.useCorrelation must be a boolean, got 1
      useCorrelation=5 => throws RangeError: options.useCorrelation must be a boolean, got 5
      useCorrelation=undefined => [[-1.4140290483128326], [-1.758296429822057], [2.1872809010613166], [0.9850445770735727]]
      useCorrelation=null => throws RangeError: options.useCorrelation must be a boolean, got null
      useCorrelation=-0 => throws RangeError: options.useCorrelation must be a boolean, got 0
      useCorrelation=-1 => throws RangeError: options.useCorrelation must be a boolean, got -1
      useCorrelation=1.5 => throws RangeError: options.useCorrelation must be a boolean, got 1.5
      useCorrelation=1e-3 => throws RangeError: options.useCorrelation must be a boolean, got 0.001
      useCorrelation=1e-12 => throws RangeError: options.useCorrelation must be a boolean, got 1e-12
      useCorrelation=1e6 => throws RangeError: options.useCorrelation must be a boolean, got 1000000
      useCorrelation=NaN => throws RangeError: options.useCorrelation must be a boolean, got NaN
      useCorrelation=Infinity => throws RangeError: options.useCorrelation must be a boolean, got Infinity
      useCorrelation=-Infinity => throws RangeError: options.useCorrelation must be a boolean, got -Infinity
      useCorrelation=MAX_SAFE_INTEGER => throws RangeError: options.useCorrelation must be a boolean, got 9007199254740991
      useCorrelation=MAX_SAFE_INTEGER+1 => throws RangeError: options.useCorrelation must be a boolean, got 9007199254740992
      useCorrelation=문자열 5 => throws RangeError: options.useCorrelation must be a boolean, got 5
      useCorrelation=true => [[-1.3072518808508318], [-1.1528877925509133], [1.3919335144177922], [1.068206158983953]]
      useCorrelation=빈 객체 => throws RangeError: options.useCorrelation must be a boolean, got [object Object]
      useCorrelation=빈 배열 => throws RangeError: options.useCorrelation must be a boolean, got 
      maxIterations => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      epsilon => throws RangeError: options.epsilon must be a finite number >= 0, got NaN
      maxIterations+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      tolerance+epsilon => throws RangeError: options.tolerance must be a finite number >= 0, got -1
      maxIterations+tolerance+epsilon => throws RangeError: options.maxIterations must be a positive safe integer, got 0
      R useCorrelation+maxIterations => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+tolerance => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+maxIterations+tolerance => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+maxIterations+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+tolerance+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      R useCorrelation+maxIterations+tolerance+epsilon => throws RangeError: options.useCorrelation must be a boolean, got yes
      dimensions 위반 + useCorrelation 위반 => throws RangeError: options.dimensions must be a positive safe integer, got 0"
    `);
  });
});

describe('부호 규약 characterization', () => {
  test('eig는 symmetric 행렬 eigenvector의 부호와 0을 고정한다', () => {
    expect(
      table({
        '1x1 양수': () => eig([[5]]),
        '1x1 음수': () => eig([[-5]]),
        '1x1 0': () => eig([[0]]),
        '1x1 -0': () => eig([[-0]]),
        '1x1 epsilon 이하': () => eig([[1e-12]]),
        '1x1 음수 epsilon 이하': () => eig([[-1e-12]]),
        '2x2 대각': () =>
          eig([
            [2, 0],
            [0, 1],
          ]),
        '2x2 음수 대각': () =>
          eig([
            [-2, 0],
            [0, -1],
          ]),
        '2x2 off-diagonal 양수': () =>
          eig([
            [2, 1],
            [1, 2],
          ]),
        '2x2 off-diagonal 음수': () =>
          eig([
            [2, -1],
            [-1, 2],
          ]),
        '2x2 swap': () =>
          eig([
            [0, 1],
            [1, 0],
          ]),
        '2x2 음수 swap': () =>
          eig([
            [0, -1],
            [-1, 0],
          ]),
        '2x2 영행렬': () =>
          eig([
            [0, 0],
            [0, 0],
          ]),
        '2x2 -0 포함': () =>
          eig([
            [-0, 0],
            [0, -0],
          ]),
        '2x2 한 축만 0': () =>
          eig([
            [0, 0],
            [0, 5],
          ]),
        '2x2 단위행렬': () =>
          eig([
            [1, 0],
            [0, 1],
          ]),
        '3x3 대각': () =>
          eig([
            [1, 0, 0],
            [0, 2, 0],
            [0, 0, 3],
          ]),
        '3x3 첫 원소가 0인 column': () =>
          eig([
            [1, 0, 0],
            [0, 2, 1],
            [0, 1, 2],
          ]),
        '3x3 음수 off-diagonal': () =>
          eig([
            [2, -1, 0],
            [-1, 2, -1],
            [0, -1, 2],
          ]),
        '3x3 영행렬': () =>
          eig([
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ]),
        '3x3 rank 1': () =>
          eig([
            [1, -1, 0],
            [-1, 1, 0],
            [0, 0, 0],
          ]),
        '3x3 일반': () => eig(SYMMETRIC_3X3),
        '4x4 일반': () =>
          eig([
            [4, -1, 0, 2],
            [-1, 3, 1, 0],
            [0, 1, 2, -1],
            [2, 0, -1, 1],
          ]),
        '2x2 epsilon 크게': () =>
          eig(
            [
              [2, 1e-3],
              [1e-3, 1],
            ],
            { epsilon: 0.01 }
          ),
      })
    ).toMatchInlineSnapshot(`
      "1x1 양수 => {values: [5], vectors: [[1]]}
      1x1 음수 => {values: [-5], vectors: [[1]]}
      1x1 0 => {values: [0], vectors: [[1]]}
      1x1 -0 => {values: [0], vectors: [[1]]}
      1x1 epsilon 이하 => {values: [0], vectors: [[1]]}
      1x1 음수 epsilon 이하 => {values: [0], vectors: [[1]]}
      2x2 대각 => {values: [2, 1], vectors: [[1, 0], [0, 1]]}
      2x2 음수 대각 => {values: [-2, -1], vectors: [[1, 0], [0, 1]]}
      2x2 off-diagonal 양수 => {values: [0.9999999999999998, 2.999999999999999], vectors: [[0.7071067811865475, 0.7071067811865475], [-0.7071067811865475, 0.7071067811865475]]}
      2x2 off-diagonal 음수 => {values: [2.999999999999999, 0.9999999999999998], vectors: [[0.7071067811865475, 0.7071067811865475], [-0.7071067811865475, 0.7071067811865475]]}
      2x2 swap => {values: [-0.9999999999999998, 0.9999999999999998], vectors: [[0.7071067811865475, 0.7071067811865475], [-0.7071067811865475, 0.7071067811865475]]}
      2x2 음수 swap => {values: [0.9999999999999998, -0.9999999999999998], vectors: [[0.7071067811865475, 0.7071067811865475], [-0.7071067811865475, 0.7071067811865475]]}
      2x2 영행렬 => {values: [0, 0], vectors: [[1, 0], [0, 1]]}
      2x2 -0 포함 => {values: [0, 0], vectors: [[1, 0], [0, 1]]}
      2x2 한 축만 0 => {values: [0, 5], vectors: [[1, 0], [0, 1]]}
      2x2 단위행렬 => {values: [1, 1], vectors: [[1, 0], [0, 1]]}
      3x3 대각 => {values: [1, 2, 3], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      3x3 첫 원소가 0인 column => {values: [1, 0.9999999999999998, 2.999999999999999], vectors: [[1, 0, 0], [0, 0.7071067811865475, 0.7071067811865475], [0, -0.7071067811865475, 0.7071067811865475]]}
      3x3 음수 off-diagonal => {values: [3.4142135623730945, 0.5857864376269046, 2.0000000000000004], vectors: [[0.5000000000000525, 0.4999999999999474, 0.7071067811865478], [-0.7071067811864733, 0.7071067811866218, 0], [0.5000000000000528, 0.49999999999994743, -0.7071067811865477]]}
      3x3 영행렬 => {values: [0, 0, 0], vectors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]}
      3x3 rank 1 => {values: [1.9999999999999996, 0, 0], vectors: [[0.7071067811865475, 0.7071067811865475, 0], [-0.7071067811865475, 0.7071067811865475, 0], [0, 0, 1]]}
      3x3 일반 => {values: [4.732050807568875, 3.000000000000002, 1.267949192431123], vectors: [[0.7886751345924675, 0.5773502691896258, 0.2113248654139395], [0.5773502691960329, -0.5773502691896257, -0.5773502691832189], [0.21132486539643486, -0.5773502691896261, 0.788675134597158]]}
      4x4 일반 => {values: [5.522826854733177, 3.1020945160885787, 1.8979054839114224, -0.5228268547331756], vectors: [[0.7905025539704921, 0.4315247128790677, 0.16995582080512361, 0.4000089415440914], [-0.40378063483324367, 0.7273800477476638, -0.5057862268663522, 0.22816607500802522], [-0.2281660750080251, 0.5057862268663522, 0.7273800477476638, -0.40378063483324383], [0.4000089415440914, 0.16995582080512348, -0.4315247128790679, -0.7905025539704921]]}
      2x2 epsilon 크게 => {values: [2.000000999999, 0.9999990000010002], vectors: [[0.999999500001375, 0], [0, 0.999999500001375]]}"
    `);
  });

  test('eig는 nonsymmetric 2x2 경로 eigenvector의 부호와 0을 고정한다', () => {
    expect(
      table({
        상삼각: () =>
          eig([
            [1, 2],
            [0, 3],
          ]),
        하삼각: () =>
          eig([
            [2, 0],
            [1, 1],
          ]),
        '음수 off-diagonal': () =>
          eig([
            [1, -2],
            [0, 3],
          ]),
        companion: () =>
          eig([
            [0, 1],
            [-2, -3],
          ]),
        '부호가 다른 고유값': () =>
          eig([
            [0, 1],
            [2, 0],
          ]),
        '복소 고유값': () =>
          eig([
            [0, -1],
            [2, 0],
          ]),
        '고유값 중복': () =>
          eig([
            [1, 1],
            [0, 1],
          ]),
        '한 열이 0': () =>
          eig([
            [1, 0],
            [2, 0],
          ]),
        '한 행이 0': () =>
          eig([
            [0, 0],
            [3, 1],
          ]),
        '-0 포함': () =>
          eig([
            [-0, 1],
            [0, 2],
          ]),
        '음수 대각': () =>
          eig([
            [-1, 4],
            [0, -3],
          ]),
        '일반 비대칭': () =>
          eig([
            [4, 1],
            [2, 3],
          ]),
        '일반 비대칭 음수': () =>
          eig([
            [-4, 1],
            [2, -3],
          ]),
        '비대칭 3x3': () =>
          eig([
            [1, 2, 0],
            [0, 3, 1],
            [0, 0, 5],
          ]),
      })
    ).toMatchInlineSnapshot(`
      "상삼각 => {values: [3, 1], vectors: [[0.7071067811865475, 1], [0.7071067811865475, 0]]}
      하삼각 => {values: [2, 1], vectors: [[0.7071067811865475, 0], [0.7071067811865475, 1]]}
      음수 off-diagonal => {values: [3, 1], vectors: [[0.7071067811865475, 1], [-0.7071067811865475, 0]]}
      companion => {values: [-1, -2], vectors: [[0.7071067811865475, 0.4472135954999579], [-0.7071067811865475, -0.8944271909999159]]}
      부호가 다른 고유값 => {values: [1.4142135623730951, -1.4142135623730951], vectors: [[0.5773502691896258, 0.5773502691896258], [0.8164965809277261, -0.8164965809277261]]}
      복소 고유값 => undefined
      고유값 중복 => undefined
      한 열이 0 => {values: [1, 0], vectors: [[0.4472135954999579, 0], [0.8944271909999159, 1]]}
      한 행이 0 => {values: [1, 0], vectors: [[0, 0.3162277660168379], [1, -0.9486832980505138]]}
      -0 포함 => {values: [2, 0], vectors: [[0.4472135954999579, 1], [0.8944271909999159, 0]]}
      음수 대각 => {values: [-1, -3], vectors: [[1, 0.8944271909999159], [0, -0.4472135954999579]]}
      일반 비대칭 => {values: [5, 2], vectors: [[0.7071067811865475, 0.4472135954999579], [0.7071067811865475, -0.8944271909999159]]}
      일반 비대칭 음수 => {values: [-2, -5], vectors: [[0.4472135954999579, 0.7071067811865475], [0.8944271909999159, -0.7071067811865475]]}
      비대칭 3x3 => undefined"
    `);
  });

  test('eigenvectorForEigenvalue는 nullspace vector의 부호와 0을 고정한다', () => {
    expect(
      table({
        '대각 lambda=1': () =>
          eigenvectorForEigenvalue(
            [
              [2, 0],
              [0, 1],
            ],
            1
          ),
        '대각 lambda=2': () =>
          eigenvectorForEigenvalue(
            [
              [2, 0],
              [0, 1],
            ],
            2
          ),
        'symmetric lambda=3': () =>
          eigenvectorForEigenvalue(
            [
              [2, 1],
              [1, 2],
            ],
            3
          ),
        'symmetric lambda=1': () =>
          eigenvectorForEigenvalue(
            [
              [2, 1],
              [1, 2],
            ],
            1
          ),
        '음수 off-diagonal lambda=1': () =>
          eigenvectorForEigenvalue(
            [
              [2, -1],
              [-1, 2],
            ],
            1
          ),
        '음수 off-diagonal lambda=3': () =>
          eigenvectorForEigenvalue(
            [
              [2, -1],
              [-1, 2],
            ],
            3
          ),
        'nilpotent lambda=0': () =>
          eigenvectorForEigenvalue(
            [
              [0, 1],
              [0, 0],
            ],
            0
          ),
        '하삼각 nilpotent lambda=0': () =>
          eigenvectorForEigenvalue(
            [
              [0, 0],
              [1, 0],
            ],
            0
          ),
        '비대칭 lambda=5': () =>
          eigenvectorForEigenvalue(
            [
              [4, 1],
              [2, 3],
            ],
            5
          ),
        '비대칭 lambda=2': () =>
          eigenvectorForEigenvalue(
            [
              [4, 1],
              [2, 3],
            ],
            2
          ),
        '고유값이 아님': () =>
          eigenvectorForEigenvalue(
            [
              [2, 0],
              [0, 1],
            ],
            7
          ),
        '영행렬 lambda=0': () =>
          eigenvectorForEigenvalue(
            [
              [0, 0],
              [0, 0],
            ],
            0
          ),
        '단위행렬 lambda=1': () =>
          eigenvectorForEigenvalue(
            [
              [1, 0],
              [0, 1],
            ],
            1
          ),
        '3x3 첫 원소가 0': () =>
          eigenvectorForEigenvalue(
            [
              [1, 0, 0],
              [0, 2, 1],
              [0, 1, 2],
            ],
            3
          ),
        '3x3 lambda=1': () =>
          eigenvectorForEigenvalue(
            [
              [1, 0, 0],
              [0, 2, 1],
              [0, 1, 2],
            ],
            1
          ),
        '3x3 음수 off-diagonal': () =>
          eigenvectorForEigenvalue(
            [
              [2, -1, 0],
              [-1, 2, -1],
              [0, -1, 2],
            ],
            2
          ),
        '3x3 lambda=2-sqrt2': () =>
          eigenvectorForEigenvalue(
            [
              [2, -1, 0],
              [-1, 2, -1],
              [0, -1, 2],
            ],
            2 - Math.SQRT2
          ),
        '3x3 상삼각': () =>
          eigenvectorForEigenvalue(
            [
              [1, 2, 3],
              [0, 4, 5],
              [0, 0, 6],
            ],
            6
          ),
        '3x3 상삼각 음수': () =>
          eigenvectorForEigenvalue(
            [
              [1, -2, 3],
              [0, 4, -5],
              [0, 0, 6],
            ],
            6
          ),
        '1x1': () => eigenvectorForEigenvalue([[-3]], -3),
        '-0 lambda': () =>
          eigenvectorForEigenvalue(
            [
              [0, 1],
              [0, 0],
            ],
            -0
          ),
        'epsilon 크게': () =>
          eigenvectorForEigenvalue(
            [
              [2, 1e-3],
              [1e-3, 1],
            ],
            2,
            { epsilon: 0.01 }
          ),
      })
    ).toMatchInlineSnapshot(`
      "대각 lambda=1 => [0, 1]
      대각 lambda=2 => [1, 0]
      symmetric lambda=3 => [0.7071067811865475, 0.7071067811865475]
      symmetric lambda=1 => [0.7071067811865475, -0.7071067811865475]
      음수 off-diagonal lambda=1 => [0.7071067811865475, 0.7071067811865475]
      음수 off-diagonal lambda=3 => [0.7071067811865475, -0.7071067811865475]
      nilpotent lambda=0 => [1, 0]
      하삼각 nilpotent lambda=0 => [0, 1]
      비대칭 lambda=5 => [0.7071067811865475, 0.7071067811865475]
      비대칭 lambda=2 => [0.4472135954999579, -0.8944271909999159]
      고유값이 아님 => undefined
      영행렬 lambda=0 => [0, 1]
      단위행렬 lambda=1 => [0, 1]
      3x3 첫 원소가 0 => [0, 0.7071067811865475, 0.7071067811865475]
      3x3 lambda=1 => [0, 0.7071067811865475, -0.7071067811865475]
      3x3 음수 off-diagonal => [0.7071067811865475, 0, -0.7071067811865475]
      3x3 lambda=2-sqrt2 => [0.5, 0.7071067811865476, 0.5]
      3x3 상삼각 => [0.5108406854512807, 0.7981885710176261, 0.3192754284070505]
      3x3 상삼각 음수 => [0.5108406854512807, -0.7981885710176261, 0.3192754284070505]
      1x1 => [1]
      -0 lambda => [1, 0]
      epsilon 크게 => [1, 0]"
    `);
  });

  test('singularValueDecomposition은 left, right vector의 부호와 0을 고정한다', () => {
    expect(
      table({
        '2x2 대각': () =>
          singularValueDecomposition([
            [3, 0],
            [0, 2],
          ]),
        '2x2 음수 대각': () =>
          singularValueDecomposition([
            [-1, 0],
            [0, -2],
          ]),
        '2x2 swap': () =>
          singularValueDecomposition([
            [0, 1],
            [1, 0],
          ]),
        '2x2 음수 swap': () =>
          singularValueDecomposition([
            [0, -3],
            [2, 0],
          ]),
        '2x2 rank 1': () =>
          singularValueDecomposition([
            [1, 0],
            [0, 0],
          ]),
        '2x2 rank 1 음수': () =>
          singularValueDecomposition([
            [-1, 1],
            [-1, 1],
          ]),
        '2x2 영행렬': () =>
          singularValueDecomposition([
            [0, 0],
            [0, 0],
          ]),
        '2x2 -0 포함': () =>
          singularValueDecomposition([
            [-0, 1],
            [0, -0],
          ]),
        '2x2 일반': () =>
          singularValueDecomposition([
            [1, 2],
            [3, 4],
          ]),
        '2x2 일반 음수': () =>
          singularValueDecomposition([
            [-1, 2],
            [3, -4],
          ]),
        '3x2 tall': () =>
          singularValueDecomposition([
            [3, 1],
            [1, 2],
            [0, 1],
          ]),
        '3x2 첫 column 0': () =>
          singularValueDecomposition([
            [0, 1],
            [0, 2],
            [0, 3],
          ]),
        '3x1 음수': () => singularValueDecomposition([[-1], [-2], [-3]]),
        '3x1 첫 원소 0': () => singularValueDecomposition([[0], [-2], [3]]),
        '2x3 wide': () =>
          singularValueDecomposition([
            [1, 0, 2],
            [0, 3, 0],
          ]),
        '1x3': () => singularValueDecomposition([[0, -1, 2]]),
        '1x1 음수': () => singularValueDecomposition([[-4]]),
        '3x3 일반': () =>
          singularValueDecomposition([
            [2, -1, 0],
            [-1, 2, -1],
            [0, -1, 2],
          ]),
        '3x3 rank 2': () =>
          singularValueDecomposition([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ]),
        '3x3 첫 행 0': () =>
          singularValueDecomposition([
            [0, 0, 0],
            [0, 2, 1],
            [0, 1, 2],
          ]),
        'epsilon 크게': () =>
          singularValueDecomposition(
            [
              [2, 1e-3],
              [1e-3, 1],
            ],
            { epsilon: 0.01 }
          ),
      })
    ).toMatchInlineSnapshot(`
      "2x2 대각 => {leftSingularVectors: [[1, 0], [0, 1]], singularValues: [3, 2], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      2x2 음수 대각 => {leftSingularVectors: [[0, -1], [-1, 0]], singularValues: [2, 1], rightSingularVectors: [[0, 1], [1, 0]], rank: 2}
      2x2 swap => {leftSingularVectors: [[0, 1], [1, 0]], singularValues: [1, 1], rightSingularVectors: [[1, 0], [0, 1]], rank: 2}
      2x2 음수 swap => {leftSingularVectors: [[-1, 0], [0, 1]], singularValues: [3, 2], rightSingularVectors: [[0, 1], [1, 0]], rank: 2}
      2x2 rank 1 => {leftSingularVectors: [[1], [0]], singularValues: [1], rightSingularVectors: [[1], [0]], rank: 1}
      2x2 rank 1 음수 => {leftSingularVectors: [[-0.7071067811865476], [-0.7071067811865476]], singularValues: [1.9999999999999998], rightSingularVectors: [[0.7071067811865475], [-0.7071067811865475]], rank: 1}
      2x2 영행렬 => {leftSingularVectors: [], singularValues: [], rightSingularVectors: [], rank: 0}
      2x2 -0 포함 => {leftSingularVectors: [[1], [0]], singularValues: [1], rightSingularVectors: [[0], [1]], rank: 1}
      2x2 일반 => {leftSingularVectors: [[0.404553584833757, -0.9145142956773059], [0.9145142956773046, 0.4045535848337581]], singularValues: [5.464985704219043, 0.3659661906262571], rightSingularVectors: [[0.5760484367663208, 0.8174155604703633], [0.8174155604703633, -0.5760484367663208]], rank: 2}
      2x2 일반 음수 => {leftSingularVectors: [[-0.404553584833757, 0.9145142956773059], [0.9145142956773046, 0.4045535848337581]], singularValues: [5.464985704219043, 0.3659661906262571], rightSingularVectors: [[0.5760484367663208, 0.8174155604703633], [-0.8174155604703633, 0.5760484367663208]], rank: 2}
      3x2 tall => {leftSingularVectors: [[0.8322451251010301, 0.5280119536280803], [0.532809988110976, -0.6774737333847893], [0.15323696784637958, -0.5120866307564896]], singularValues: [3.6585741494651303, 1.6170452043358268], rightSingularVectors: [[0.8280672304692729, 0.5606288093051837], [0.5606288093051837, -0.8280672304692729]], rank: 2}
      3x2 첫 column 0 => {leftSingularVectors: [[0.2672612419124244], [0.5345224838248488], [0.8017837257372732]], singularValues: [3.7416573867739413], rightSingularVectors: [[0], [1]], rank: 1}
      3x1 음수 => {leftSingularVectors: [[-0.2672612419124244], [-0.5345224838248488], [-0.8017837257372732]], singularValues: [3.7416573867739413], rightSingularVectors: [[1]], rank: 1}
      3x1 첫 원소 0 => {leftSingularVectors: [[0], [-0.5547001962252291], [0.8320502943378437]], singularValues: [3.605551275463989], rightSingularVectors: [[1]], rank: 1}
      2x3 wide => {leftSingularVectors: [[0, 1], [1, 0]], singularValues: [3, 2.23606797749979], rightSingularVectors: [[0, 0.4472135954999579], [1, 0], [0, 0.8944271909999159]], rank: 2}
      1x3 => {leftSingularVectors: [[-1]], singularValues: [2.23606797749979], rightSingularVectors: [[0], [0.4472135954999579], [-0.8944271909999159]], rank: 1}
      1x1 음수 => {leftSingularVectors: [[-1]], singularValues: [4], rightSingularVectors: [[1]], rank: 1}
      3x3 일반 => {leftSingularVectors: [[0.5000000000000002, 0.7071067811865476, 0.49999999999999667], [-0.7071067811865474, 0, 0.707106781186552], [0.5, -0.7071067811865475, 0.49999999999999706]], singularValues: [3.4142135623730967, 2.0000000000000004, 0.5857864376269052], rightSingularVectors: [[0.500000000000001, 0.7071067811865477, 0.4999999999999996], [-0.7071067811865472, 0, 0.7071067811865486], [0.5000000000000006, -0.7071067811865476, 0.4999999999999997]], rank: 3}
      3x3 rank 2 => {leftSingularVectors: [[0.21483723836839697, -0.8872306883463317], [0.5205873894647373, -0.24964395298820052], [0.8263375405610777, 0.3879427823699297]], singularValues: [16.84810335261421, 1.0683695145547067], rightSingularVectors: [[0.47967117787776226, 0.7766909903215652], [0.5723677939720616, 0.0756864701045651], [0.6650644100663605, -0.6253180501124347]], rank: 2}
      3x3 첫 행 0 => {leftSingularVectors: [[0, 0], [0.7071067811865476, 0.7071067811865475], [0.7071067811865476, -0.7071067811865475]], singularValues: [2.9999999999999996, 1], rightSingularVectors: [[0, 0], [0.7071067811865475, 0.7071067811865475], [0.7071067811865475, -0.7071067811865475]], rank: 2}
      epsilon 크게 => {leftSingularVectors: [[0.9999990000023751, 0], [0, 1.0000005000008751]], singularValues: [2.000000999999, 0.999999000001], rightSingularVectors: [[0.999999500001375, 0], [0, 0.999999500001375]], rank: 2}"
    `);
  });

  test('svd를 쓰는 columnSpace, pseudoInverse, solveUnderdeterminedSystem은 부호가 결과에 미치는 영향을 고정한다', () => {
    const matrices: Record<string, Matrix> = {
      '음수 swap': [
        [0, -3],
        [2, 0],
      ],
      'rank 1 음수': [
        [-1, 1],
        [-1, 1],
      ],
      '3x2 tall': [
        [3, 1],
        [1, 2],
        [0, 1],
      ],
      '3x2 첫 column 0': [
        [0, 1],
        [0, 2],
        [0, 3],
      ],
      '2x3 wide': [
        [1, 0, 2],
        [0, 3, 0],
      ],
      '2x2 -0 포함': [
        [-0, 1],
        [0, -0],
      ],
      '3x3 rank 2': [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    };
    const cases: Record<string, () => unknown> = {};
    for (const [label, matrix] of Object.entries(matrices)) {
      cases[`columnSpace ${label}`] = () => columnSpace(matrix);
      cases[`pseudoInverse ${label}`] = () => pseudoInverse(matrix);
    }
    cases['solveUnderdeterminedSystem 2x3'] = () =>
      solveUnderdeterminedSystem(
        [
          [1, 0, 2],
          [0, 3, 0],
        ],
        [1, -3]
      );
    cases['solveUnderdeterminedSystem 2x3 음수'] = () =>
      solveUnderdeterminedSystem(
        [
          [-1, 0, 2],
          [0, -3, 0],
        ],
        [1, -3]
      );
    expect(table(cases)).toMatchInlineSnapshot(`
      "columnSpace 음수 swap => [[-1, 0], [0, 1]]
      pseudoInverse 음수 swap => [[0, 0.5], [-0.3333333333333333, 0]]
      columnSpace rank 1 음수 => [[-0.7071067811865476, -0.7071067811865476]]
      pseudoInverse rank 1 음수 => [[-0.25000000000000006, -0.25000000000000006], [0.25000000000000006, 0.25000000000000006]]
      columnSpace 3x2 tall => [[0.8322451251010301, 0.532809988110976, 0.15323696784637958], [0.5280119536280803, -0.6774737333847893, -0.5120866307564896]]
      pseudoInverse 3x2 tall => [[0.37142857142857133, -0.11428571428571425, -0.14285714285714285], [-0.14285714285714277, 0.4285714285714287, 0.2857142857142857]]
      columnSpace 3x2 첫 column 0 => [[0.2672612419124244, 0.5345224838248488, 0.8017837257372732]]
      pseudoInverse 3x2 첫 column 0 => [[0, 0, 0], [0.07142857142857144, 0.14285714285714288, 0.2142857142857143]]
      columnSpace 2x3 wide => [[0, 1], [1, 0]]
      pseudoInverse 2x3 wide => [[0.19999999999999998, 0], [0, 0.3333333333333333], [0.39999999999999997, 0]]
      columnSpace 2x2 -0 포함 => [[1, 0]]
      pseudoInverse 2x2 -0 포함 => [[0, 0], [1, 0]]
      columnSpace 3x3 rank 2 => [[0.21483723836839697, 0.5205873894647373, 0.8263375405610777], [-0.8872306883463317, -0.24964395298820052, 0.3879427823699297]]
      pseudoInverse 3x3 rank 2 => [[-0.6388888888888669, -0.16666666666659782, 0.30555555555567043], [-0.0555555555555585, 0, 0.055555555555568986], [0.5277777777777496, 0.1666666666666083, -0.1944444444445324]]
      solveUnderdeterminedSystem 2x3 => [0.19999999999999998, -1, 0.39999999999999997]
      solveUnderdeterminedSystem 2x3 음수 => [-0.19999999999999998, 1, 0.39999999999999997]"
    `);
  });

  test('pca는 component row의 부호와 0을 고정한다', () => {
    expect(
      table({
        '일반 양의 상관': () =>
          pca([
            [1, 2],
            [2, 4],
            [3, 5],
            [4, 8],
          ]),
        '음의 상관': () =>
          pca([
            [1, -1],
            [2, -2],
            [3, -3],
          ]),
        '음의 상관 sample': () =>
          pca(
            [
              [1, -1],
              [2, -2.5],
              [3, -3],
              [4, -4.5],
            ],
            { mode: 'sample' }
          ),
        '첫 변수 상수': () =>
          pca([
            [0, 1],
            [0, 2],
            [0, 3],
          ]),
        '둘째 변수 상수': () =>
          pca([
            [1, 0],
            [2, 0],
            [3, 0],
          ]),
        '둘째 변수 음의 상수': () =>
          pca([
            [1, -5],
            [2, -5],
            [3, -5],
          ]),
        '전부 0': () =>
          pca([
            [0, 0],
            [0, 0],
          ]),
        '전부 -0': () =>
          pca([
            [-0, -0],
            [-0, -0],
          ]),
        '전부 상수': () =>
          pca([
            [3, 3],
            [3, 3],
          ]),
        '3변수 한 column 0': () =>
          pca([
            [1, 0, 2],
            [2, 0, 1],
            [3, 0, 5],
            [4, 0, 3],
          ]),
        '3변수 첫 변수 상수': () =>
          pca([
            [0, 1, 2],
            [0, 2, 1],
            [0, 3, 5],
            [0, 4, 3],
          ]),
        '3변수 음의 상관': () =>
          pca([
            [1, -1, 0],
            [2, -3, 1],
            [3, -2, -1],
            [4, -5, 2],
          ]),
        '3변수 직교': () =>
          pca([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [-1, 0, 0],
            [0, -1, 0],
            [0, 0, -1],
          ]),
        'rows orientation': () =>
          pca(
            [
              [1, 2, 3, 4],
              [-1, -2, -3, -4],
            ],
            { orientation: 'rows' }
          ),
        'useCorrelation 음의 상관': () =>
          pca(
            [
              [1, -10],
              [2, -30],
              [3, -20],
              [4, -50],
            ],
            { useCorrelation: true }
          ),
        'useCorrelation 첫 변수 상수': () =>
          pca(
            [
              [1, 1],
              [1, 2],
              [1, 3],
            ],
            { useCorrelation: true }
          ),
        'epsilon 크게': () => pca(PCA_DATA, { epsilon: 0.5 }),
        '변수 1개': () => pca([[-1], [-2], [-4]]),
        '변수 1개 상수': () => pca([[2], [2], [2]]),
      })
    ).toMatchInlineSnapshot(`
      "일반 양의 상관 => {components: [[0.45482487827466495, 0.8905808947548988], [0.8905808947548988, -0.45482487827466495]], explainedVariance: [5.900426408217659, 0.03707359178233993], explainedVarianceRatio: [0.9937560266471849, 0.006243973352815148], means: [2.5, 4.75], standardDeviations: undefined, rank: 2}
      음의 상관 => {components: [[0.7071067811865475, -0.7071067811865475]], explainedVariance: [1.333333333333333], explainedVarianceRatio: [1], means: [2, -2], standardDeviations: undefined, rank: 1}
      음의 상관 sample => {components: [[0.6659918587924757, -0.7459590096125546], [0.7459590096125546, 0.6659918587924757]], explainedVariance: [3.720132485457045, 0.02986751454295611], explainedVarianceRatio: [0.9920353294552117, 0.007964670544788294], means: [2.5, -2.75], standardDeviations: undefined, rank: 2}
      첫 변수 상수 => {components: [[0, 1]], explainedVariance: [0.6666666666666666], explainedVarianceRatio: [1], means: [0, 2], standardDeviations: undefined, rank: 1}
      둘째 변수 상수 => {components: [[1, 0]], explainedVariance: [0.6666666666666666], explainedVarianceRatio: [1], means: [2, 0], standardDeviations: undefined, rank: 1}
      둘째 변수 음의 상수 => {components: [[1, 0]], explainedVariance: [0.6666666666666666], explainedVarianceRatio: [1], means: [2, -5], standardDeviations: undefined, rank: 1}
      전부 0 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [0, 0], standardDeviations: undefined, rank: 0}
      전부 -0 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [0, 0], standardDeviations: undefined, rank: 0}
      전부 상수 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [3, 3], standardDeviations: undefined, rank: 0}
      3변수 한 column 0 => {components: [[0.5137015609692952, 0, 0.8579689424785196], [0.8579689424785196, 0, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 0, 2.75], standardDeviations: undefined, rank: 2}
      3변수 첫 변수 상수 => {components: [[0, 0.5137015609692952, 0.8579689424785196], [0, 0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [0, 2.5, 2.75], standardDeviations: undefined, rank: 2}
      3변수 음의 상관 => {components: [[0.47122469667738226, -0.7455833759430384, 0.4712246966773822], [0.7071067811673729, 0, -0.7071067812057219], [0.5272070610949993, 0.6664123569663021, 0.5272070610435641]], explainedVariance: [3.9255590255566593, 0.7499999999999998, 0.011940974443341348], explainedVarianceRatio: [0.837452592118754, 0.15999999999999995, 0.0025474078812461544], means: [2.5, -2.75, 0.5], standardDeviations: undefined, rank: 3}
      3변수 직교 => {components: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], explainedVariance: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333], explainedVarianceRatio: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333], means: [0, 0, 0], standardDeviations: undefined, rank: 3}
      rows orientation => {components: [[0.7071067811865475, -0.7071067811865475]], explainedVariance: [2.4999999999999996], explainedVarianceRatio: [1], means: [2.5, -2.5], standardDeviations: undefined, rank: 1}
      useCorrelation 음의 상관 => {components: [[0.7071067811865475, -0.7071067811865475], [0.7071067811865475, 0.7071067811865475]], explainedVariance: [1.8315218406202995, 0.1684781593797], explainedVarianceRatio: [0.91576092031015, 0.08423907968985002], means: [2.5, -27.5], standardDeviations: [1.118033988749895, 14.79019945774904], rank: 2}
      useCorrelation 첫 변수 상수 => throws RangeError: variable[0] variance must be non-zero for useCorrelation: true
      epsilon 크게 => {components: [[0.5137015609692952, 0.8579689424785196], [0.8579689424785196, -0.5137015609692952]], explainedVariance: [2.711398760891787, 0.726101239108213], explainedVarianceRatio: [0.7887705486230653, 0.2112294513769347], means: [2.5, 2.75], standardDeviations: undefined, rank: 2}
      변수 1개 => {components: [[1]], explainedVariance: [1.5555555555555554], explainedVarianceRatio: [1], means: [-2.3333333333333335], standardDeviations: undefined, rank: 1}
      변수 1개 상수 => {components: [], explainedVariance: [], explainedVarianceRatio: [], means: [2], standardDeviations: undefined, rank: 0}"
    `);
  });

  test('reduceDimensionsInto는 projection 결과의 부호와 0을 고정한다', () => {
    expect(
      table({
        '음의 상관 1차원': () =>
          reduceDimensionsInto(
            [],
            [
              [1, -1],
              [2, -2],
              [3, -3],
            ],
            { dimensions: 1 }
          ),
        '첫 변수 상수 1차원': () =>
          reduceDimensionsInto(
            [],
            [
              [0, 1],
              [0, 2],
              [0, 3],
            ],
            { dimensions: 1 }
          ),
        '3변수 2차원': () =>
          reduceDimensionsInto(
            [],
            [
              [1, -1, 0],
              [2, -3, 1],
              [3, -2, -1],
              [4, -5, 2],
            ],
            { dimensions: 2 }
          ),
        '전부 0': () =>
          reduceDimensionsInto(
            [],
            [
              [0, 0],
              [0, 0],
            ],
            { dimensions: 1 }
          ),
      })
    ).toMatchInlineSnapshot(`
      "음의 상관 1차원 => [[-1.414213562373095], [0], [1.414213562373095]]
      첫 변수 상수 1차원 => [[-1], [0], [1]]
      3변수 2차원 => [[-2.2472203012550813, -0.7071067811481984], [0.18639584398575956, -0.7071067811865475], [-1.0304122286346609, 1.4142135623922694], [3.091236685903983, -5.7523541485693386e-11]]
      전부 0 => throws RangeError: options.dimensions (1) exceeds PCA rank (0)"
    `);
  });
});
