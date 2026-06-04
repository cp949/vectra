/**
 * S8-RM-009E linalg matrix construction / norm utility unit test.
 *
 * outerProduct(Into), slogDet, blockMatrix(Into), spectralNorm, nuclearNorm 정책을 한곳에서 고정한다.
 * shape / aliasing / output atomicity / overflow / signed-zero canonicalize / convergence failure를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { blockMatrix } from '../../../src/linalg/block-matrix';
import { blockMatrixInto } from '../../../src/linalg/block-matrix-into';
import { nuclearNorm } from '../../../src/linalg/nuclear-norm';
import { outerProduct } from '../../../src/linalg/outer-product';
import { outerProductInto } from '../../../src/linalg/outer-product-into';
import { slogDet } from '../../../src/linalg/slog-det';
import { spectralNorm } from '../../../src/linalg/spectral-norm';

const NON_FINITE_NUMBERS = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] as const;

function makeMatrix(rows: number, columns: number, value = 0): number[][] {
  return Array.from({ length: rows }, () => new Array<number>(columns).fill(value));
}

function expectPositiveZero(value: number): void {
  expect(Object.is(value, 0)).toBe(true);
}

function expectMatrixEntriesArePositiveZero(matrix: readonly (readonly number[])[]): void {
  for (const row of matrix) {
    for (const entry of row) {
      expectPositiveZero(entry);
    }
  }
}

function expectRangeErrorWithoutMutation(run: () => void, out: readonly (readonly number[])[]): void {
  const before = out.map((row) => [...row]);
  expect(run).toThrow(RangeError);
  expect(out).toEqual(before);
}

describe('outerProductInto — vector outer product (Into)', () => {
  test('두 vector의 outer product를 out에 기록하고 out을 반환한다', () => {
    const out: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    const result = outerProductInto(out, [1, 2], [3, 4, 5]);
    expect(result).toBe(out);
    expect(out).toEqual([
      [3, 4, 5],
      [6, 8, 10],
    ]);
  });

  test('음수와 signed zero가 섞여도 결과 entry는 +0으로 canonicalize된다', () => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    outerProductInto(out, [-0, 2], [3, -0]);
    // -0 * 3 = -0 → +0 으로 canonicalize, 2 * -0 = -0 → +0
    expect(out).toEqual([
      [0, 0],
      [6, 0],
    ]);
    // Object.is로 +0 vs -0를 직접 확인한다.
    expectPositiveZero(out[0][0]);
    expectPositiveZero(out[0][1]);
    expectPositiveZero(out[1][1]);
  });

  test.each([
    ['a', [], [1, 2]],
    ['b', [1, 2], []],
  ] as const)('%s가 빈 vector이면 RangeError를 던지고 out을 수정하지 않는다', (_name, a, b) => {
    const out: number[][] = [[9]];
    expectRangeErrorWithoutMutation(() => outerProductInto(out, a, b), out);
  });

  test.each(NON_FINITE_NUMBERS)('non-finite 입력 %s는 RangeError를 던지고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [[9, 9]];
    expectRangeErrorWithoutMutation(() => outerProductInto(out, [1, bad], [3, 4]), out);
  });

  test('non-empty zero vector는 정상 계산이며 결과 entry는 모두 +0이다', () => {
    const out = makeMatrix(3, 3, 9);
    outerProductInto(out, [0, 0, 0], [1, 2, 3]);
    expect(out).toEqual(makeMatrix(3, 3));
    expectMatrixEntriesArePositiveZero(out);
  });

  test('곱 entry가 overflow되면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out: number[][] = [[9]];
    expectRangeErrorWithoutMutation(() => outerProductInto(out, [Number.MAX_VALUE], [2]), out);
  });

  test.each([
    ['row 개수', [[9, 9]]],
    ['row capacity', [[9], [9]]],
  ] as const)('out %s가 부족하면 RangeError를 던지고 out을 수정하지 않는다', (_name, initialOut) => {
    const out = initialOut.map((row) => [...row]);
    expectRangeErrorWithoutMutation(() => outerProductInto(out, [1, 2], [3, 4]), out);
  });

  test('out row가 입력 b vector 인스턴스와 같아도 안전하다 (out[k] === b)', () => {
    // caller가 b를 out의 한 row로 재사용하는 경우. temp matrix → commitMatrixInto 덕분에 안전하다.
    const b: number[] = [5, 6];
    const out: number[][] = [b, [9, 9]];
    outerProductInto(out, [3, 4], b);
    // commit 후에도 같은 row 인스턴스를 가리킨다.
    expect(out[0]).toBe(b);
    expect(out).toEqual([
      [3 * 5, 3 * 6],
      [4 * 5, 4 * 6],
    ]);
  });

  test('out row가 입력 a vector 인스턴스와 같아도 안전하다 (out[k] === a)', () => {
    // caller가 a를 out의 한 row로 재사용하는 경우. commit 후 그 row가 outer product의 한 행으로 덮어써진다.
    const a: number[] = [3, 4];
    const out: number[][] = [a, [9, 9]];
    outerProductInto(out, a, [5, 6]);
    expect(out[0]).toBe(a);
    expect(out).toEqual([
      [3 * 5, 3 * 6],
      [4 * 5, 4 * 6],
    ]);
  });

  test('out row capacity가 입력보다 크면 columns로 truncate한다', () => {
    const out: number[][] = [
      [9, 9, 9, 9],
      [9, 9, 9, 9],
    ];
    outerProductInto(out, [1, 2], [3, 4, 5]);
    expect(out).toEqual([
      [3, 4, 5],
      [6, 8, 10],
    ]);
  });
});

describe('outerProduct — vector outer product (companion)', () => {
  test('새 number[][] 배열을 반환한다', () => {
    expect(outerProduct([1, 2], [3, 4, 5])).toEqual([
      [3, 4, 5],
      [6, 8, 10],
    ]);
  });

  test('곱 entry overflow는 RangeError', () => {
    expect(() => outerProduct([Number.MAX_VALUE], [2])).toThrow(RangeError);
  });

  test('빈 vector는 RangeError', () => {
    expect(() => outerProduct([], [1])).toThrow(RangeError);
    expect(() => outerProduct([1], [])).toThrow(RangeError);
  });

  test('signed zero는 +0으로 canonicalize된다', () => {
    const r = outerProduct([-0, 1], [2, -0]);
    expectPositiveZero(r[0][0]);
    expectPositiveZero(r[0][1]);
    expectPositiveZero(r[1][1]);
  });
});

describe('slogDet — sign과 log-absolute determinant', () => {
  test('positive diagonal matrix는 sign 1과 log(product)를 반환한다', () => {
    const r = slogDet([
      [2, 0],
      [0, 3],
    ]);
    expect(r.sign).toBe(1);
    expect(r.logAbsDet).toBeCloseTo(Math.log(6), 12);
  });

  test('빈 matrix는 empty product identity {sign:1, logAbsDet:0}', () => {
    expect(slogDet([])).toEqual({ sign: 1, logAbsDet: 0 });
  });

  test('determinant -2인 2x2는 sign -1과 log(2)를 반환한다', () => {
    // [[1, 2], [3, 4]] determinant = 1*4 - 2*3 = -2
    const r = slogDet([
      [1, 2],
      [3, 4],
    ]);
    expect(r.sign).toBe(-1);
    expect(r.logAbsDet).toBeCloseTo(Math.log(2), 12);
  });

  test('row swap이 일어나는 행렬도 정확한 sign과 log를 반환한다', () => {
    // [[0, 1], [1, 0]] determinant = -1 → 첫 column에 swap 1회 발생 → sign -1.
    const r = slogDet([
      [0, 1],
      [1, 0],
    ]);
    expect(r.sign).toBe(-1);
    expect(r.logAbsDet).toBeCloseTo(0, 12);
  });

  test('row swap 2회로 sign이 +1로 되돌아간다', () => {
    // 3x3 identity의 row 0,1,2를 (2, 0, 1) 순서로 섞은 행렬 → swap 2회 발생.
    // determinant = +1.
    const r = slogDet([
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
    ]);
    expect(r.sign).toBe(1);
    expect(r.logAbsDet).toBeCloseTo(0, 12);
  });

  test('negative diagonal matrix는 부호를 누적한다', () => {
    // diag(-2, -3, -4) determinant = -24.
    const r = slogDet([
      [-2, 0, 0],
      [0, -3, 0],
      [0, 0, -4],
    ]);
    expect(r.sign).toBe(-1);
    expect(r.logAbsDet).toBeCloseTo(Math.log(24), 12);
  });

  test('singular matrix는 {sign:0, logAbsDet:-Infinity}를 반환한다', () => {
    const r = slogDet([
      [1, 2],
      [2, 4],
    ]);
    expect(r).toEqual({ sign: 0, logAbsDet: Number.NEGATIVE_INFINITY });
  });

  test('non-square matrix는 RangeError', () => {
    expect(() => slogDet([[1, 2, 3]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => slogDet([[1, 2], [3]] as unknown as readonly (readonly number[])[])).toThrow(RangeError);
  });

  test.each(NON_FINITE_NUMBERS)('non-finite entry %s는 RangeError', (bad) => {
    expect(() =>
      slogDet([
        [bad, 0],
        [0, 1],
      ])
    ).toThrow(RangeError);
  });

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('invalid options.epsilon %s는 RangeError', (bad) => {
    expect(() => slogDet([[1]], { epsilon: bad })).toThrow(RangeError);
  });

  test('huge diagonal matrix는 determinant overflow 없이 finite logAbsDet을 반환한다', () => {
    // diag(1e200, 1e200, 1e200) → det = 1e600(>>MAX_VALUE)이지만 logAbsDet은 finite다.
    const r = slogDet([
      [1e200, 0, 0],
      [0, 1e200, 0],
      [0, 0, 1e200],
    ]);
    expect(r.sign).toBe(1);
    expect(Number.isFinite(r.logAbsDet)).toBe(true);
    expect(r.logAbsDet).toBeCloseTo(3 * Math.log(1e200), 8);
  });

  test('non-singular 결과의 logAbsDet과 sign에는 -0이 남지 않는다', () => {
    // 음수 entry가 섞인 non-singular matrix에서 logAbsDet은 finite이고 -0이 남지 않는다.
    // det([[-1]]) = -1 → sign = -1, logAbsDet = log(1) = +0. Object.is로 +0/-0를 직접 구분.
    const r1 = slogDet([[-1]]);
    expect(r1.sign).toBe(-1);
    expect(Number.isFinite(r1.logAbsDet)).toBe(true);
    expect(Object.is(r1.logAbsDet, -0)).toBe(false);
    expectPositiveZero(r1.logAbsDet);

    // det([[1, 2], [3, 4]]) = -2 → sign = -1, logAbsDet = log(2) > 0.
    const r2 = slogDet([
      [1, 2],
      [3, 4],
    ]);
    expect(r2.sign).toBe(-1);
    expect(Number.isFinite(r2.logAbsDet)).toBe(true);
    expect(Object.is(r2.logAbsDet, -0)).toBe(false);

    // singular 케이스의 sign 0이 +0인지(즉 -0이 아닌지) 확인.
    const r3 = slogDet([
      [1, 2],
      [2, 4],
    ]);
    expect(r3.sign).toBe(0);
    expect(Object.is(r3.sign, -0)).toBe(false);
    expectPositiveZero(r3.sign);
  });
});

describe('blockMatrixInto — nested block grid를 하나의 matrix로 합친다 (Into)', () => {
  test('2x2 block grid를 정상 병합한다', () => {
    // [[A, B], [C, D]] where each is 2x2 → 4x4
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [5, 6],
      [7, 8],
    ];
    const C = [
      [9, 10],
      [11, 12],
    ];
    const D = [
      [13, 14],
      [15, 16],
    ];
    const out = makeMatrix(4, 4);
    const result = blockMatrixInto(out, [
      [A, B],
      [C, D],
    ]);
    expect(result).toBe(out);
    expect(out).toEqual([
      [1, 2, 5, 6],
      [3, 4, 7, 8],
      [9, 10, 13, 14],
      [11, 12, 15, 16],
    ]);
  });

  test('non-square block들도 row/column 호환만 맞으면 정상 병합한다', () => {
    // top-left 1x2, top-right 1x1, bottom-left 2x2, bottom-right 2x1
    const out = makeMatrix(3, 3);
    blockMatrixInto(out, [
      [[[1, 2]], [[3]]],
      [
        [
          [4, 5],
          [6, 7],
        ],
        [[8], [9]],
      ],
    ]);
    expect(out).toEqual([
      [1, 2, 3],
      [4, 5, 8],
      [6, 7, 9],
    ]);
  });

  test('빈 grid는 out.length = 0만 설정한다', () => {
    const out: number[][] = [[9]];
    blockMatrixInto(out, []);
    expect(out).toEqual([]);
  });

  test.each([
    ['빈 block row', [[]]],
    ['같은 block row 안에서 block row count 다름', [[[[1]], [[1], [2]]]]],
    [
      '같은 block column 위치에서 column count 다름',
      [
        [[[1, 2]], [[3]]],
        [[[4]], [[5]]],
      ],
    ],
    ['block row마다 block 개수 다름', [[[[1]], [[2]]], [[[3]]]]],
    ['one-sided zero shape [[]]', [[[[]]]]],
  ] as const)('%s이면 RangeError이고 out을 수정하지 않는다', (_name, blocks) => {
    const out: number[][] = [[9]];
    expectRangeErrorWithoutMutation(() => blockMatrixInto(out, blocks), out);
  });

  test.each(NON_FINITE_NUMBERS)('non-finite block entry %s는 RangeError이고 out을 수정하지 않는다', (bad) => {
    const out: number[][] = [
      [9, 9],
      [9, 9],
    ];
    expectRangeErrorWithoutMutation(() => blockMatrixInto(out, [[[[1, 2]], [[bad, 4]]]]), out);
  });

  test.each([
    ['row 개수', [[9, 9]], [[[[1, 2]]], [[[3, 4]]]]],
    ['row capacity', [[9]], [[[[1, 2]]]]],
  ] as const)('out %s가 부족하면 RangeError이고 out을 수정하지 않는다', (_name, initialOut, blocks) => {
    const out = initialOut.map((row) => [...row]);
    expectRangeErrorWithoutMutation(() => blockMatrixInto(out, blocks), out);
  });

  test('out row가 입력 block row 객체와 같은 array여도 안전하다', () => {
    // out[0]은 a block row의 첫 row와 같은 number[] 인스턴스다. temp commit이 안전성을 보장한다.
    const innerRow: number[] = [1, 2];
    const out: number[][] = [innerRow, [9, 9]];
    blockMatrixInto(out, [[[innerRow]], [[[3, 4]]]]);
    expect(out).toEqual([
      [1, 2],
      [3, 4],
    ]);
    // commit 후에도 같은 row 객체를 가리킨다.
    expect(out[0]).toBe(innerRow);
  });

  test('block 안 row와 out row가 같은 인스턴스여도 다른 값으로 정확히 덮어써진다', () => {
    // out[0] === innerRow 이면서 동시에 blocks[1][0][0] === innerRow.
    // in-place 가상 구현은 out[0]에 [5, 6]을 쓰는 순간 innerRow가 [5, 6]으로 바뀌어
    // 이후 out[1] = innerRow도 [5, 6]으로 오염된다. temp-commit 구현은 별도 buffer에서
    // 결과를 만든 뒤 commit하므로 out[1]은 원본 innerRow 값 [1, 2]를 받는다.
    const innerRow: number[] = [1, 2];
    const out: number[][] = [innerRow, [9, 9]];
    blockMatrixInto(out, [[[[5, 6]]], [[innerRow]]]);
    expect(out[0]).toBe(innerRow);
    expect(out[0]).toEqual([5, 6]);
    expect(out[1]).toEqual([1, 2]);
  });

  test('입력 block의 -0은 결과에 그대로 보존된다', () => {
    // blockMatrix*는 산술이 아닌 rearrangement copy이므로 별도의 -0 canonicalize를 수행하지 않는다.
    const out: number[][] = [[9, 9]];
    blockMatrixInto(out, [[[[-0, 0]]]]);
    expect(Object.is(out[0][0], -0)).toBe(true);
    expect(Object.is(out[0][1], 0)).toBe(true);
  });
});

describe('blockMatrix — block grid의 companion', () => {
  test('새 number[][] 배열을 반환한다 (2x2)', () => {
    expect(
      blockMatrix([
        [[[1]], [[2]]],
        [[[3]], [[4]]],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test('빈 grid는 빈 배열을 반환한다', () => {
    expect(blockMatrix([])).toEqual([]);
  });

  test('호환되지 않는 block은 RangeError', () => {
    expect(() =>
      blockMatrix([
        [[[1, 2]], [[3]]],
        [[[4]], [[5]]],
      ])
    ).toThrow(RangeError);
  });

  test('입력 block의 -0은 결과에 그대로 보존된다', () => {
    // companion도 *Into와 같은 정책. rearrangement copy이므로 -0 canonicalize 없음.
    const r = blockMatrix([[[[-0, 0]]]]);
    expect(Object.is(r[0][0], -0)).toBe(true);
    expect(Object.is(r[0][1], 0)).toBe(true);
  });
});

describe.each([
  ['spectralNorm — SVD largest singular value', spectralNorm, 3],
  ['nuclearNorm — SVD singular value 합', nuclearNorm, 5],
] as const)('%s', (_name, norm, diagonalExpected) => {
  test('diagonal(3, 2) 값을 반환한다', () => {
    expect(
      norm([
        [3, 0],
        [0, 2],
      ])
    ).toBeCloseTo(diagonalExpected, 9);
  });

  test('zero matrix는 0', () => {
    expect(norm(makeMatrix(2, 2))).toBe(0);
  });

  test('빈 matrix는 0', () => {
    expect(norm([])).toBe(0);
  });

  test('rank-1 outer product 값은 5', () => {
    // [[1,2],[2,4]] = outer([1,2], [1,2]) → singular value 5.
    expect(
      norm([
        [1, 2],
        [2, 4],
      ])
    ).toBeCloseTo(5, 9);
  });

  test('options.maxIterations=1, tolerance=0이면 convergence 실패로 undefined', () => {
    expect(
      norm(
        [
          [1, 2],
          [3, 4],
        ],
        { maxIterations: 1, tolerance: 0 }
      )
    ).toBeUndefined();
  });

  test('invalid options는 matrix 검증보다 먼저 RangeError', () => {
    // error message regex로 options 분기 throw를 식별한다.
    expect(() => norm([[Number.NaN]], { maxIterations: 0 })).toThrow(/maxIterations/);
    expect(() => norm([[Number.NaN]], { tolerance: -1 })).toThrow(/tolerance/);
    expect(() => norm([[Number.NaN]], { epsilon: Number.POSITIVE_INFINITY })).toThrow(/options\.epsilon/);
  });

  test.each(NON_FINITE_NUMBERS)('non-finite matrix entry %s는 RangeError', (bad) => {
    expect(() => norm([[bad]])).toThrow(RangeError);
  });

  test('ragged matrix는 RangeError', () => {
    expect(() => norm([[1, 2], [3]] as unknown as readonly (readonly number[])[])).toThrow(RangeError);
  });

  test('결과에 -0이 남지 않는다', () => {
    const r = norm([
      [-0, 0],
      [0, -0],
    ]);
    if (r === undefined) {
      throw new Error('expected finite matrix norm');
    }
    expect(r).toBe(0);
    expectPositiveZero(r);
  });
});

describe('spectralNorm — 전용 케이스', () => {
  test('rectangular 2x3 매트릭스도 largest singular value를 반환한다', () => {
    // sigma_max of [[1, 0, 0], [0, 2, 0]] = 2
    const r = spectralNorm([
      [1, 0, 0],
      [0, 2, 0],
    ]);
    expect(r).toBeCloseTo(2, 9);
  });
});

describe('nuclearNorm — 전용 케이스', () => {
  test('orthogonal columns 2x2는 singular value 합을 반환한다', () => {
    // [[3, 0], [0, 4]] → sigma 3과 4 → sum 7
    const r = nuclearNorm([
      [3, 0],
      [0, 4],
    ]);
    expect(r).toBeCloseTo(7, 9);
  });
});
