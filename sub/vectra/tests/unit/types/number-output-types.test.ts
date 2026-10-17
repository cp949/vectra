/**
 * 새 숫자 값을 만드는 Into 함수의 출력 배열 타입 테스트.
 *
 * 대상 함수:
 *  - uniqueIndicesInto, rangePermutationInto : 새 index를 push하는 random Into
 *  - dirichletInto, multivariateNormalInto : 새 sample 값을 push하는 distribution Into
 *  - haltonSequenceInto, sobolSequenceInto : 새 `number[]` row를 push하는 sequence Into
 *  - forwardDifferenceMatrixInto 외 2종 : 차분 계수 `-1`, `0`, `1`을 기록하는 calculus Into
 *  - createRandomState의 같은 method : facade 타입도 같은 계약을 따른다
 *
 * 고정하는 계약:
 *  - 반환 타입은 caller의 좁은 원소 타입(`(0 | 1)[]`)을 따르지 않고 `number[]`, `number[][]`다.
 *  - 실제 값이 `0 | 1`을 벗어나므로 좁은 타입을 반환하면 거짓이 된다.
 *
 * 배열은 공변이라 좁은 배열 인자는 컴파일된다. 거부가 아니라 반환 타입으로 검사한다.
 * 타입 검사는 `pnpm typecheck`(tsc)에서만 실패한다. vitest 런타임 검사는 변경 전에도 통과한다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { backwardDifferenceMatrixInto } from '../../../src/calculus/backward-difference-matrix-into';
import { centralDifferenceMatrixInto } from '../../../src/calculus/central-difference-matrix-into';
import { forwardDifferenceMatrixInto } from '../../../src/calculus/forward-difference-matrix-into';
import { dirichletInto } from '../../../src/random/dirichlet-into';
import { haltonSequenceInto } from '../../../src/random/halton-sequence-into';
import { multivariateNormalInto } from '../../../src/random/multivariate-normal-into';
import { rangePermutationInto } from '../../../src/random/range-permutation-into';
import { sobolSequenceInto } from '../../../src/random/sobol-sequence-into';
import { uniqueIndicesInto } from '../../../src/random/unique-indices-into';
import { createRandomState } from '../../../src/random-state/create-random-state';

type Bit = 0 | 1;

describe('새 숫자 값을 만드는 Into의 출력 배열 타입', () => {
  test('index를 만드는 Into는 좁은 원소 배열을 넘겨도 number[]를 반환한다', () => {
    const narrow: Bit[] = [];
    const picked = uniqueIndicesInto(narrow, 3, 10);
    expectTypeOf(picked).toEqualTypeOf<number[]>();
    expect(picked).toHaveLength(3);
    expect(picked).toBe(narrow);

    const permuted = rangePermutationInto([] as Bit[], 4);
    expectTypeOf(permuted).toEqualTypeOf<number[]>();
    expect(permuted.slice().sort()).toEqual([0, 1, 2, 3]);
  });

  test('distribution Into는 좁은 원소 배열을 넘겨도 number[]를 반환한다', () => {
    const weights = dirichletInto([] as Bit[], [1, 2, 3]);
    expectTypeOf(weights).toEqualTypeOf<number[]>();
    expect(weights).toHaveLength(3);

    const sample = multivariateNormalInto(
      [] as Bit[],
      [10, 20],
      [
        [1, 0],
        [0, 1],
      ]
    );
    expectTypeOf(sample).toEqualTypeOf<number[]>();
    expect(sample).toHaveLength(2);
  });

  test('sequence Into는 좁은 row 배열을 넘겨도 number[][]를 반환한다', () => {
    const halton = haltonSequenceInto([] as Bit[][], 3, 2);
    expectTypeOf(halton).toEqualTypeOf<number[][]>();
    expect(halton).toHaveLength(3);

    const sobol = sobolSequenceInto([] as Bit[][], 3, 2);
    expectTypeOf(sobol).toEqualTypeOf<number[][]>();
    expect(sobol).toHaveLength(3);
  });

  test('차분 행렬 Into는 좁은 row 배열을 넘겨도 number[][]를 반환한다', () => {
    const makeOut = (): Bit[][] => [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    const forward = forwardDifferenceMatrixInto(makeOut(), 3);
    expectTypeOf(forward).toEqualTypeOf<number[][]>();
    // 계수 -1이 기록되므로 Bit 배열이라는 타입 약속은 거짓이다
    expect(forward[0]).toEqual([-1, 1, 0]);

    const backward = backwardDifferenceMatrixInto(makeOut(), 3);
    expectTypeOf(backward).toEqualTypeOf<number[][]>();

    const central = centralDifferenceMatrixInto(makeOut(), 3);
    expectTypeOf(central).toEqualTypeOf<number[][]>();
  });

  test('createRandomState의 같은 method도 number 배열을 반환한다', () => {
    const state = createRandomState(1);

    expectTypeOf(state.uniqueIndicesInto([] as Bit[], 2, 5)).toEqualTypeOf<number[]>();
    expectTypeOf(state.rangePermutationInto([] as Bit[], 3)).toEqualTypeOf<number[]>();
    expectTypeOf(state.dirichletInto([] as Bit[], [1, 1])).toEqualTypeOf<number[]>();
    expectTypeOf(state.multivariateNormalInto([] as Bit[], [0], [[1]])).toEqualTypeOf<number[]>();
    expectTypeOf(state.haltonSequenceInto([] as Bit[][], 2, 2)).toEqualTypeOf<number[][]>();
    expectTypeOf(state.sobolSequenceInto([] as Bit[][], 2, 2)).toEqualTypeOf<number[][]>();
  });
});
