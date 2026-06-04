/**
 * vec scalar, rounding, constant helper 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import type { XYInput, XYWritable } from '../../../src/types';
import { ceil } from '../../../src/vec/ceil';
import { ceilInto } from '../../../src/vec/ceil-into';
import { chebyshevDistance } from '../../../src/vec/chebyshev-distance';
import { chebyshevLength } from '../../../src/vec/chebyshev-length';
import { componentProduct } from '../../../src/vec/component-product';
import { componentSum } from '../../../src/vec/component-sum';
import { floor } from '../../../src/vec/floor';
import { floorInto } from '../../../src/vec/floor-into';
import { one } from '../../../src/vec/one';
import { oneInto } from '../../../src/vec/one-into';
import { round } from '../../../src/vec/round';
import { roundInto } from '../../../src/vec/round-into';
import { zero } from '../../../src/vec/zero';
import { zeroInto } from '../../../src/vec/zero-into';
import {
  type ConstantCompanion,
  type ConstantInto,
  expectNaNComponents,
  expectObjectOut,
  expectTupleOut,
  expectXY,
  testUnaryBehavior,
  type UnaryBehaviorCase,
} from './component-helper-test-utils';

describe('vec constants - zero and one', () => {
  const cases: ReadonlyArray<{
    name: string;
    into: ConstantInto;
    companion: ConstantCompanion;
    expected: readonly [number, number];
  }> = [
    { name: 'zero', into: zeroInto, companion: zero, expected: [0, 0] },
    { name: 'one', into: oneInto, companion: one, expected: [1, 1] },
  ];

  for (const helper of cases) {
    describe(helper.name, () => {
      test('out에 constant vector를 기록하고 out을 반환한다', () => {
        expectObjectOut((out) => helper.into(out), helper.expected, [99, 99]);
      });

      test('mutable tuple out에 constant vector를 기록하고 tuple reference를 반환한다', () => {
        expectTupleOut((out) => helper.into(out), helper.expected);
      });

      test('companion은 constant vector 새 object를 반환한다', () => {
        expectXY(helper.companion(), helper.expected);
      });

      test('companion은 호출마다 새 object를 반환한다', () => {
        const a = helper.companion();
        const b = helper.companion();

        expect(a).not.toBe(b);
      });
    });
  }
});

describe('vec scalar helpers', () => {
  test.each([
    ['componentSum은 양수 성분 벡터의 x + y를 반환한다', componentSum, { x: 3, y: 5 }, 8],
    ['componentSum은 음수 성분 벡터의 x + y를 반환한다', componentSum, { x: -3, y: -5 }, -8],
    ['componentSum은 혼합 부호 벡터의 x + y를 반환한다', componentSum, { x: 10, y: -3 }, 7],
    ['componentSum은 tuple 입력을 처리한다', componentSum, [4, 6] as const, 10],
    ['componentSum은 영 벡터에서 0을 반환한다', componentSum, { x: 0, y: 0 }, 0],
    ['componentProduct는 양수 성분 벡터의 x * y를 반환한다', componentProduct, { x: 3, y: 5 }, 15],
    ['componentProduct는 부호가 다른 두 성분의 x * y를 음수로 반환한다', componentProduct, { x: 3, y: -5 }, -15],
    ['componentProduct는 둘 다 음수인 성분의 x * y를 양수로 반환한다', componentProduct, { x: -3, y: -5 }, 15],
    ['componentProduct는 tuple 입력을 처리한다', componentProduct, [4, 6] as const, 24],
    ['componentProduct는 성분 중 하나가 0이면 0을 반환한다', componentProduct, { x: 0, y: 100 }, 0],
    ['chebyshevLength는 x > |y|일 때 |x|를 반환한다', chebyshevLength, { x: 5, y: 3 }, 5],
    ['chebyshevLength는 |y| > |x|일 때 |y|를 반환한다', chebyshevLength, { x: 2, y: 7 }, 7],
    ['chebyshevLength는 |x| === |y|일 때 그 값을 반환한다', chebyshevLength, { x: 4, y: 4 }, 4],
    ['chebyshevLength는 음수 x 성분의 절댓값을 기준으로 계산한다', chebyshevLength, { x: -6, y: 3 }, 6],
    ['chebyshevLength는 음수 y 성분의 절댓값을 기준으로 계산한다', chebyshevLength, { x: 2, y: -8 }, 8],
    ['chebyshevLength는 영 벡터에서 0을 반환한다', chebyshevLength, { x: 0, y: 0 }, 0],
    ['chebyshevLength는 tuple 입력을 처리한다', chebyshevLength, [3, 5] as const, 5],
  ])('%s', (_title, fn, input, expected) => {
    expect(fn(input)).toBe(expected);
  });

  test.each([
    ['일반 두 점 사이의 Chebyshev 거리를 반환한다', { x: 1, y: 2 }, { x: 5, y: 8 }, 6],
    ['x 방향 차이가 더 클 때 x 차이를 반환한다', { x: 0, y: 0 }, { x: 10, y: 1 }, 10],
    ['같은 점 사이의 Chebyshev 거리는 0이다', { x: 3, y: 4 }, { x: 3, y: 4 }, 0],
    ['음수 좌표 차이의 절댓값을 기준으로 계산한다', { x: 3, y: 4 }, { x: -2, y: -1 }, 5],
    ['tuple 입력을 처리한다', [0, 0] as const, [3, 4] as const, 4],
  ])('%s', (_title, a, b, expected) => {
    expect(chebyshevDistance(a, b)).toBe(expected);
  });
});

describe('vec component-wise - rounding helpers', () => {
  const cases: ReadonlyArray<
    UnaryBehaviorCase & {
      name: string;
      exampleTitle: string;
      input: XYInput;
      expected: readonly [number, number];
      integerExpected: readonly [number, number];
    }
  > = [
    {
      name: 'floor',
      into: floorInto,
      companion: floor,
      exampleTitle: '각 성분을 내림하여 out에 기록한다',
      input: { x: 2.7, y: -1.3 },
      expected: [2, -2],
      integerExpected: [3, -5],
      aliasInput: { x: 2.9, y: -1.1 },
      aliasExpected: [2, -2],
      tupleInput: [1.5, -0.5],
      tupleExpected: [1, -1],
    },
    {
      name: 'ceil',
      into: ceilInto,
      companion: ceil,
      exampleTitle: '각 성분을 올림하여 out에 기록한다',
      input: { x: 2.1, y: -1.9 },
      expected: [3, -1],
      integerExpected: [3, -5],
      aliasInput: { x: 1.1, y: -2.9 },
      aliasExpected: [2, -2],
      tupleInput: [1.5, -1.5],
      tupleExpected: [2, -1],
    },
    {
      name: 'round',
      into: roundInto,
      companion: round,
      exampleTitle: '각 성분을 반올림하여 out에 기록한다',
      input: { x: 2.4, y: -1.6 },
      expected: [2, -2],
      integerExpected: [3, -5],
      aliasInput: { x: 2.6, y: -1.4 },
      aliasExpected: [3, -1],
      tupleInput: [1.7, -0.7],
      tupleExpected: [2, -1],
    },
  ];

  for (const helper of cases) {
    describe(helper.name, () => {
      test(helper.exampleTitle, () => {
        expectObjectOut((out) => helper.into(out, helper.input), helper.expected);
      });

      test('정수 성분은 그대로 기록한다', () => {
        expectObjectOut((out) => helper.into(out, { x: 3, y: -5 }), helper.integerExpected);
      });

      testUnaryBehavior(helper);

      test('NaN 입력은 NaN으로 통과된다', () => {
        const out: XYWritable = { x: 0, y: 0 };
        helper.into(out, { x: NaN, y: NaN });

        expectNaNComponents(out);
      });

      test('Infinity/-Infinity 입력은 그대로 통과된다', () => {
        const out: XYWritable = { x: 0, y: 0 };
        helper.into(out, { x: Infinity, y: -Infinity });

        expect(out.x).toBe(Infinity);
        expect(out.y).toBe(-Infinity);
      });

      test('companion은 산술 예제 입력에서도 동일한 결과를 반환한다', () => {
        expectXY(helper.companion(helper.input), helper.expected);
      });
    });
  }

  test('roundInto는 0.5를 양의 무한대 방향으로 올림한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    roundInto(out, { x: 0.5, y: 1.5 });

    expect(out.x).toBe(1);
    expect(out.y).toBe(2);
  });
});
