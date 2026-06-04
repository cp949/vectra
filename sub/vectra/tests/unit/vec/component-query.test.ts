/**
 * vec 성분 질의 helper 단위 테스트.
 *
 * componentMinIndex/componentMinEntry/componentMaxIndex/componentMaxEntry의
 * index·key 반환, tie 우선순위, NaN/signed-zero 정책, tuple/object 입력을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { componentMax } from '../../../src/vec/component-max';
import { componentMaxEntry } from '../../../src/vec/component-max-entry';
import { componentMaxIndex } from '../../../src/vec/component-max-index';
import { componentMin } from '../../../src/vec/component-min';
import { componentMinEntry } from '../../../src/vec/component-min-entry';
import { componentMinIndex } from '../../../src/vec/component-min-index';

describe('vec component query helpers', () => {
  test('componentMinIndex는 더 작은 성분의 인덱스를 반환한다', () => {
    expect(componentMinIndex([1, 2])).toBe(0);
    expect(componentMinIndex({ x: 1, y: 2 })).toBe(0);
    expect(componentMinIndex([2, 1])).toBe(1);
    expect(componentMinIndex({ x: 2, y: 1 })).toBe(1);
  });

  test('componentMaxIndex는 더 큰 성분의 인덱스를 반환한다', () => {
    expect(componentMaxIndex([2, 1])).toBe(0);
    expect(componentMaxIndex({ x: 2, y: 1 })).toBe(0);
    expect(componentMaxIndex([1, 2])).toBe(1);
    expect(componentMaxIndex({ x: 1, y: 2 })).toBe(1);
  });

  test('두 성분이 같으면 인덱스 0(x 우선)을 반환한다', () => {
    expect(componentMinIndex([3, 3])).toBe(0);
    expect(componentMaxIndex([3, 3])).toBe(0);
  });

  test('componentMinEntry / componentMaxEntry는 key literal을 반환한다', () => {
    expect(componentMinEntry([1, 2])).toBe('x');
    expect(componentMinEntry([2, 1])).toBe('y');
    expect(componentMaxEntry([1, 2])).toBe('y');
    expect(componentMaxEntry([2, 1])).toBe('x');
    expect(componentMinEntry([3, 3])).toBe('x');
    expect(componentMaxEntry([3, 3])).toBe('x');
  });

  test('한 성분만 NaN이면 그 성분의 위치를 반환한다', () => {
    expect(componentMinIndex([Number.NaN, 1])).toBe(0);
    expect(componentMinIndex([1, Number.NaN])).toBe(1);
    expect(componentMaxIndex([Number.NaN, 1])).toBe(0);
    expect(componentMaxIndex([1, Number.NaN])).toBe(1);
    expect(componentMinEntry([1, Number.NaN])).toBe('y');
    expect(componentMaxEntry([Number.NaN, 1])).toBe('x');
  });

  test('두 성분이 모두 NaN이면 x 위치를 반환한다', () => {
    expect(componentMinIndex([Number.NaN, Number.NaN])).toBe(0);
    expect(componentMaxIndex([Number.NaN, Number.NaN])).toBe(0);
    expect(componentMinEntry([Number.NaN, Number.NaN])).toBe('x');
    expect(componentMaxEntry([Number.NaN, Number.NaN])).toBe('x');
  });

  test('signed zero는 Math.min / Math.max 결과 성분을 가리킨다', () => {
    // Math.min(+0, -0) = -0 → y, Math.max(+0, -0) = +0 → x.
    expect(componentMinIndex([0, -0])).toBe(1);
    expect(componentMinIndex([-0, 0])).toBe(0);
    expect(componentMaxIndex([0, -0])).toBe(0);
    expect(componentMaxIndex([-0, 0])).toBe(1);
    expect(componentMinEntry([0, -0])).toBe('y');
    expect(componentMaxEntry([0, -0])).toBe('x');
  });

  test('반환 인덱스가 가리키는 성분 값은 componentMin / componentMax와 일치한다', () => {
    const cases: ReadonlyArray<[number, number]> = [
      [1, 2],
      [2, 1],
      [3, 3],
      [0, -0],
      [-0, 0],
      [Number.NaN, 5],
      [5, Number.NaN],
    ];
    for (const c of cases) {
      expect(Object.is(c[componentMinIndex(c)], componentMin(c))).toBe(true);
      expect(Object.is(c[componentMaxIndex(c)], componentMax(c))).toBe(true);
    }
  });

  test('tuple 입력과 object 입력을 동일하게 처리한다', () => {
    expect(componentMinIndex([5, 9])).toBe(componentMinIndex({ x: 5, y: 9 }));
    expect(componentMaxEntry([5, 9])).toBe(componentMaxEntry({ x: 5, y: 9 }));
  });
});
