/**
 * vec component-wise unary/binary helper 단위 테스트.
 *
 * unary, binary, addScaled helper의 out 반환, aliasing, tuple 입력, companion 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import type { XYInput, XYWritable } from '../../../src/types';
import { abs } from '../../../src/vec/abs';
import { absInto } from '../../../src/vec/abs-into';
import { addScaled } from '../../../src/vec/add-scaled';
import { addScaledInto } from '../../../src/vec/add-scaled-into';
import { divide } from '../../../src/vec/divide';
import { divideInto } from '../../../src/vec/divide-into';
import { max } from '../../../src/vec/max';
import { maxInto } from '../../../src/vec/max-into';
import { min } from '../../../src/vec/min';
import { minInto } from '../../../src/vec/min-into';
import { multiply } from '../../../src/vec/multiply';
import { multiplyInto } from '../../../src/vec/multiply-into';
import { negate } from '../../../src/vec/negate';
import { negateInto } from '../../../src/vec/negate-into';
import {
  type BinaryBehaviorCase,
  expectCompanionMatchesInto,
  expectNaNComponents,
  expectObjectOut,
  expectTupleOut,
  expectXY,
  testBinaryBehavior,
  testUnaryBehavior,
  type UnaryBehaviorCase,
} from './component-helper-test-utils';

describe('vec component-wise - unary helpers', () => {
  const cases: ReadonlyArray<
    UnaryBehaviorCase & {
      name: string;
      examples: ReadonlyArray<{ title: string; input: XYInput; expected: readonly [number, number] }>;
    }
  > = [
    {
      name: 'negate',
      into: negateInto,
      companion: negate,
      examples: [
        {
          title: '양수 성분 벡터를 부정하여 음수 성분 벡터를 out에 기록한다',
          input: { x: 3, y: 5 },
          expected: [-3, -5],
        },
        {
          title: '음수 성분 벡터를 부정하여 양수 성분 벡터를 out에 기록한다',
          input: { x: -2, y: -7 },
          expected: [2, 7],
        },
      ],
      aliasInput: { x: 4, y: -6 },
      aliasExpected: [-4, 6],
      tupleInput: [1, -2],
      tupleExpected: [-1, 2],
    },
    {
      name: 'abs',
      into: absInto,
      companion: abs,
      examples: [
        {
          title: '음수 성분 벡터의 각 성분을 절댓값으로 변환하여 out에 기록한다',
          input: { x: -3, y: -5 },
          expected: [3, 5],
        },
        { title: '양수 성분 벡터는 변경 없이 out에 기록한다', input: { x: 3, y: 5 }, expected: [3, 5] },
        { title: '혼합 부호 벡터의 각 성분을 절댓값으로 변환한다', input: { x: -4, y: 7 }, expected: [4, 7] },
      ],
      aliasInput: { x: -3, y: -5 },
      aliasExpected: [3, 5],
      tupleInput: [-3, -5],
      tupleExpected: [3, 5],
    },
  ];

  for (const helper of cases) {
    describe(helper.name, () => {
      for (const example of helper.examples) {
        test(example.title, () => {
          expectObjectOut((out) => helper.into(out, example.input), example.expected);
        });
      }

      testUnaryBehavior(helper);
    });
  }

  test('negateInto는 영 벡터를 부정해도 throw하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    negateInto(out, { x: 0, y: 0 });

    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });
});

describe('vec component-wise - binary helpers', () => {
  const cases: ReadonlyArray<
    BinaryBehaviorCase & {
      exampleTitle: string;
    }
  > = [
    {
      name: 'multiply',
      into: multiplyInto,
      companion: multiply,
      exampleTitle: 'a와 b의 각 성분을 곱한 벡터를 out에 기록한다',
      a: { x: 3, y: 4 },
      b: { x: 2, y: -5 },
      expected: [6, -20],
      aliasExpected: [15, 16],
    },
    {
      name: 'divide',
      into: divideInto,
      companion: divide,
      exampleTitle: 'a의 각 성분을 b의 각 성분으로 나눈 벡터를 out에 기록한다',
      a: { x: 6, y: -20 },
      b: { x: 2, y: -5 },
      expected: [3, 4],
      aliasExpected: [0.6, 4],
    },
    {
      name: 'min',
      into: minInto,
      companion: min,
      exampleTitle: 'a와 b의 각 성분 중 작은 값으로 구성된 벡터를 out에 기록한다',
      a: { x: 3, y: 8 },
      b: { x: 5, y: 2 },
      expected: [3, 2],
    },
    {
      name: 'max',
      into: maxInto,
      companion: max,
      exampleTitle: 'a와 b의 각 성분 중 큰 값으로 구성된 벡터를 out에 기록한다',
      a: { x: 3, y: 8 },
      b: { x: 5, y: 2 },
      expected: [5, 8],
    },
  ];

  for (const helper of cases) {
    describe(helper.name, () => {
      test(helper.exampleTitle, () => {
        expectObjectOut((out) => helper.into(out, helper.a, helper.b), helper.expected);
      });

      testBinaryBehavior(helper);
    });
  }

  test('divideInto는 b.x가 0이면 x 성분에 Infinity를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    divideInto(out, { x: 1, y: 2 }, { x: 0, y: 1 });

    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(2);
  });

  test('divideInto는 a.x와 b.x가 모두 0이면 x 성분에 NaN을 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    divideInto(out, { x: 0, y: 2 }, { x: 0, y: 1 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(2);
  });

  test('divideInto는 b.y가 0이면 y 성분에 Infinity를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    divideInto(out, { x: 2, y: 1 }, { x: 1, y: 0 });

    expect(out.x).toBe(2);
    expect(out.y).toBe(Infinity);
  });

  test('minInto는 NaN 입력에서 Math.min 정책을 따른다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    minInto(out, { x: NaN, y: 1 }, { x: 2, y: NaN });

    expectNaNComponents(out);
  });

  test('maxInto는 NaN 입력에서 Math.max 정책을 따른다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    maxInto(out, { x: NaN, y: 1 }, { x: 2, y: NaN });

    expectNaNComponents(out);
  });

  test('minInto와 maxInto는 Infinity/-Infinity 입력을 처리한다', () => {
    const minOut: XYWritable = { x: 0, y: 0 };
    const maxOut: XYWritable = { x: 0, y: 0 };

    minInto(minOut, { x: Infinity, y: -Infinity }, { x: 5, y: 5 });
    maxInto(maxOut, { x: Infinity, y: -Infinity }, { x: 5, y: 5 });

    expect(minOut.x).toBe(5);
    expect(minOut.y).toBe(-Infinity);
    expect(maxOut.x).toBe(Infinity);
    expect(maxOut.y).toBe(5);
  });
});

describe('vec component-wise - addScaled', () => {
  test.each([
    ['a에 b * scalar를 더한 벡터를 out에 기록한다', { x: 1, y: 2 }, { x: 3, y: 4 }, 2, [7, 10] as const],
    ['scalar=0이면 a를 그대로 out에 기록한다', { x: 5, y: 6 }, { x: 100, y: 200 }, 0, [5, 6] as const],
    ['scalar=1이면 a + b를 out에 기록한다', { x: 1, y: 2 }, { x: 3, y: 4 }, 1, [4, 6] as const],
    ['scalar=-1이면 a - b를 out에 기록한다', { x: 5, y: 8 }, { x: 2, y: 3 }, -1, [3, 5] as const],
  ])('%s', (_title, a, b, scalar, expected) => {
    expectObjectOut((out) => addScaledInto(out, a, b, scalar), expected);
  });

  test('out === a aliasing에서도 올바른 결과를 반환한다', () => {
    const a: XYWritable = { x: 1, y: 2 };
    addScaledInto(a, a, { x: 3, y: 4 }, 2);

    expectXY(a, [7, 10]);
  });

  test('out === b aliasing에서도 올바른 결과를 반환한다', () => {
    const b: XYWritable = { x: 3, y: 4 };
    addScaledInto(b, { x: 1, y: 2 }, b, 2);

    expectXY(b, [7, 10]);
  });

  test('out === a === b (트리플 aliasing)에서도 올바른 결과를 반환한다', () => {
    const ab: XYWritable = { x: 2, y: 3 };
    addScaledInto(ab, ab, ab, 2);

    expectXY(ab, [6, 9]);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    expectTupleOut((out) => addScaledInto(out, { x: 1, y: 2 }, { x: 3, y: 4 }, 2), [7, 10]);
  });

  test('companion은 새 object를 반환한다', () => {
    expectXY(addScaled({ x: 1, y: 2 }, { x: 3, y: 4 }, 2), [7, 10]);
  });

  test('companion은 Into와 동일한 결과를 반환한다', () => {
    expectCompanionMatchesInto(
      (out) => addScaledInto(out, [1, 2], { x: 3, y: 4 }, 2),
      () => addScaled([1, 2], { x: 3, y: 4 }, 2)
    );
  });
});
