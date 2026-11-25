/**
 * createTableSampler unit test.
 *
 * 표를 생성 시점에 한 번 검증하고 `t` 위치 값을 조회하는 함수를 검증한다.
 *
 * 검증:
 *  - 같은 table, 같은 options의 `sampleTableAt`과 같은 값을 반환한다.
 *    linear/nearest, clamp/extrapolate, 표 길이 1을 모두 비교한다.
 *  - table과 options 검증은 생성 시점에, `t` 검증은 호출 시점에 RangeError로 거부한다.
 *  - table은 생성 시점에 복사하므로 원본을 바꿔도 결과가 변하지 않는다.
 *
 * 성능은 단위 테스트에서 재지 않는다.
 */

import { describe, expect, test } from 'vitest';
import { createTableSampler } from '../../../src/interpolation/create-table-sampler';
import { sampleTableAt } from '../../../src/interpolation/sample-table-at';
import type { SampleTableOptions } from '../../../src/types';

const TABLES: ReadonlyArray<readonly number[]> = [
  [7],
  [0, 10],
  [0, 10, 20],
  [3, -1, 4, -1, 5, -9, 2.5],
  [-0, 0, 1e-300, 1e300],
];

const OPTIONS: ReadonlyArray<SampleTableOptions | undefined> = [
  undefined,
  { interpolation: 'linear' },
  { interpolation: 'nearest' },
  { extrapolate: true },
  { interpolation: 'nearest', extrapolate: true },
  { extrapolate: false },
];

const T_VALUES = [-100, -1, -0.5, -Number.MIN_VALUE, 0, 0.1, 0.25, 0.3333333, 0.5, 0.75, 0.999999, 1, 1.5, 2, 100];

describe('createTableSampler — sampleTableAt와 같은 값', () => {
  test('모든 table, options, t 조합에서 sampleTableAt과 같은 값을 반환한다', () => {
    for (const table of TABLES) {
      for (const options of OPTIONS) {
        const sample = createTableSampler(table, options);
        for (const t of T_VALUES) {
          // Object.is로 비교해 -0과 +0도 구분한다.
          expect(Object.is(sample(t), sampleTableAt(table, t, options)), `table=${table} t=${t}`).toBe(true);
        }
      }
    }
  });

  test('손으로 계산한 값을 반환한다', () => {
    const sample = createTableSampler([0, 10, 20]);
    expect(sample(0.25)).toBe(5);
    expect(sample(1)).toBe(20);
    expect(sample(2)).toBe(20);
    expect(createTableSampler([0, 10, 20], { extrapolate: true })(1.5)).toBe(30);
    expect(createTableSampler([0, 10, 20], { interpolation: 'nearest' })(0.25)).toBe(10);
  });

  test('같은 sampler를 여러 번 불러도 결과가 변하지 않는다', () => {
    const sample = createTableSampler([0, 10, 20]);
    expect(sample(0.25)).toBe(5);
    expect(sample(0.75)).toBe(15);
    expect(sample(0.25)).toBe(5);
  });

  test('서로 다른 table로 만든 sampler는 독립적이다', () => {
    const a = createTableSampler([0, 1]);
    const b = createTableSampler([10, 20]);
    expect(a(0.5)).toBe(0.5);
    expect(b(0.5)).toBe(15);
  });
});

describe('createTableSampler — 입력 검증', () => {
  test('빈 table이면 생성 시점에 RangeError를 던진다', () => {
    expect(() => createTableSampler([])).toThrow(RangeError);
  });

  test('table에 finite하지 않은 값이 있으면 생성 시점에 RangeError를 던진다', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => createTableSampler([0, bad, 2])).toThrow(RangeError);
      expect(() => createTableSampler([bad])).toThrow(RangeError);
    }
  });

  test('unknown interpolation이면 길이 1 table이어도 생성 시점에 RangeError를 던진다', () => {
    const options = { interpolation: 'cubic' } as unknown as SampleTableOptions;
    expect(() => createTableSampler([0, 1], options)).toThrow(RangeError);
    expect(() => createTableSampler([5], options)).toThrow(RangeError);
  });

  test('t가 finite하지 않으면 호출 시점에 RangeError를 던진다', () => {
    const sample = createTableSampler([0, 10]);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => sample(bad)).toThrow(RangeError);
    }
    // 길이 1 table과 extrapolate에서도 같다.
    expect(() => createTableSampler([5])(Number.NaN)).toThrow(RangeError);
    expect(() => createTableSampler([0, 10], { extrapolate: true })(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('t가 잘못되어 던진 뒤에도 sampler는 계속 쓸 수 있다', () => {
    const sample = createTableSampler([0, 10]);
    expect(() => sample(Number.NaN)).toThrow(RangeError);
    expect(sample(0.5)).toBe(5);
  });
});

describe('createTableSampler — table 복사', () => {
  test('생성 뒤 원본 table을 바꿔도 결과가 변하지 않는다', () => {
    const table = [0, 10, 20];
    const sample = createTableSampler(table);
    table[1] = Number.NaN;
    table.push(1000);

    expect(sample(0.5)).toBe(10);
    expect(sample(1)).toBe(20);
  });

  test('readonly 배열 입력을 받는다', () => {
    const table: readonly number[] = Object.freeze([1, 3]);
    expect(createTableSampler(table)(0.5)).toBe(2);
  });
});
