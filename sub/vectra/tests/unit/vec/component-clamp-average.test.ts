/**
 * vec clamp / average helper 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import type { XYInput, XYWritable } from '../../../src/types';
import { average } from '../../../src/vec/average';
import { averageInto } from '../../../src/vec/average-into';
import { clamp } from '../../../src/vec/clamp';
import { clampInto } from '../../../src/vec/clamp-into';
import {
  expectCompanionMatchesInto,
  expectNaNComponents,
  expectObjectOut,
  expectTupleOut,
  expectXY,
} from './component-helper-test-utils';

function expectAverageOut(inputs: ReadonlyArray<XYInput>, expected: readonly [number, number]) {
  const out: XYWritable = { x: 0, y: 0 };
  const result = averageInto(out, inputs);

  expect(result).toBe(true);
  expectXY(out, expected);
}

describe('vec component-wise - clamp', () => {
  test.each([
    ['범위 내 입력은 변경 없이 out에 기록한다', { x: 3, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 10 }, [3, 5] as const],
    ['하한보다 작은 성분은 하한으로 clamp한다', { x: -5, y: -3 }, { x: 0, y: 0 }, { x: 10, y: 10 }, [0, 0] as const],
    ['상한보다 큰 성분은 상한으로 clamp한다', { x: 15, y: 20 }, { x: 0, y: 0 }, { x: 10, y: 10 }, [10, 10] as const],
    ['x와 y에 각각 다른 범위를 적용한다', { x: -5, y: 25 }, { x: 0, y: 10 }, { x: 20, y: 30 }, [0, 25] as const],
    [
      'caller가 ordered bounds를 전달한 경우 올바른 결과를 반환한다',
      { x: 5, y: 5 },
      { x: 2, y: 2 },
      { x: 8, y: 8 },
      [5, 5] as const,
    ],
  ])('%s', (_title, input, minValue, maxValue, expected) => {
    expectObjectOut((out) => clampInto(out, input, minValue, maxValue), expected);
  });

  test('out === input self-aliasing에서도 올바른 결과를 반환한다', () => {
    const vec: XYWritable = { x: 15, y: -5 };
    clampInto(vec, vec, { x: 0, y: 0 }, { x: 10, y: 10 });

    expectXY(vec, [10, 0]);
  });

  test('tuple 입력을 처리하고 out을 반환한다', () => {
    expectObjectOut((out) => clampInto(out, [5, 5], [0, 0], [10, 10]), [5, 5]);
  });

  test('mutable tuple out에 결과를 기록하고 tuple reference를 반환한다', () => {
    expectTupleOut((out) => clampInto(out, { x: 15, y: -3 }, { x: 0, y: 0 }, { x: 10, y: 10 }), [10, 0]);
  });

  test('NaN 입력은 Math.min/Math.max 정책을 따른다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    clampInto(out, { x: NaN, y: 1 }, { x: 0, y: 0 }, { x: 10, y: 10 });

    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(1);
  });

  test('Infinity/-Infinity 입력은 상한/하한으로 clamp된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    clampInto(out, { x: Infinity, y: -Infinity }, { x: 0, y: 0 }, { x: 10, y: 10 });

    expect(out.x).toBe(10);
    expect(out.y).toBe(0);
  });

  test('companion은 input을 [min, max] 범위로 clamp한 새 object를 반환한다', () => {
    expectXY(clamp({ x: 15, y: -3 }, { x: 0, y: 0 }, { x: 10, y: 10 }), [10, 0]);
  });

  test('companion은 Into와 동일한 결과를 반환한다', () => {
    expectCompanionMatchesInto(
      (out) => clampInto(out, [5, -2], [0, 0], [10, 10]),
      () => clamp([5, -2], [0, 0], [10, 10])
    );
  });
});

describe('vec component-wise - average', () => {
  test.each([
    ['단일 입력의 평균은 해당 입력 자체이다', [{ x: 4, y: 6 }], [4, 6] as const],
    [
      '여러 입력의 성분별 평균을 out에 기록한다',
      [
        { x: 2, y: 1 },
        { x: 4, y: 5 },
        { x: 6, y: 3 },
      ],
      [4, 3] as const,
    ],
    ['tuple 입력과 object 입력을 혼합하여 처리한다', [[0, 0] as const, { x: 4, y: 6 }], [2, 3] as const],
  ])('%s', (_title, inputs, expected) => {
    expectAverageOut(inputs, expected);
  });

  test('빈 배열이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const result = averageInto(out, []);

    expect(result).toBe(false);
    expectXY(out, [99, 99]);
  });

  test('NaN 입력은 NaN으로 통과된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    averageInto(out, [
      { x: NaN, y: 1 },
      { x: 2, y: NaN },
    ]);

    expectNaNComponents(out);
  });

  test('Infinity/-Infinity 입력은 그대로 반영된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    averageInto(out, [
      { x: Infinity, y: -Infinity },
      { x: 4, y: 6 },
    ]);

    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(-Infinity);
  });

  test('합산 overflow가 발생하면 Infinity가 기록된다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const big = Number.MAX_VALUE;
    averageInto(out, [
      { x: big, y: -big },
      { x: big, y: -big },
    ]);

    expect(out.x).toBe(Infinity);
    expect(out.y).toBe(-Infinity);
  });

  test('companion은 여러 입력의 평균을 새 object로 반환한다', () => {
    expectXY(
      average([
        { x: 2, y: 4 },
        { x: 6, y: 8 },
      ]) ?? { x: NaN, y: NaN },
      [4, 6]
    );
  });

  test('companion은 빈 배열이면 undefined를 반환한다', () => {
    expect(average([])).toBeUndefined();
  });

  test('companion은 Into와 동일한 결과를 반환한다', () => {
    const inputs = [
      { x: 2, y: 4 },
      { x: 6, y: 8 },
    ];

    expectCompanionMatchesInto(
      (out) => averageInto(out, inputs),
      () => average(inputs) ?? { x: NaN, y: NaN }
    );
  });
});
