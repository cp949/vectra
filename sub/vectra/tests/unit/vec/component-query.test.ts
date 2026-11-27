/**
 * vec 성분 질의 helper 단위 테스트.
 *
 * componentMinIndex/componentMinEntry/componentMaxIndex/componentMaxEntry의
 * index·key 반환, tie 우선순위, NaN/signed-zero 정책, 점 객체 입력을 검증한다.
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
    expect(componentMinIndex({ x: 1, y: 2 })).toBe(0);
    expect(componentMinIndex({ x: 1, y: 2 })).toBe(0);
    expect(componentMinIndex({ x: 2, y: 1 })).toBe(1);
    expect(componentMinIndex({ x: 2, y: 1 })).toBe(1);
  });

  test('componentMaxIndex는 더 큰 성분의 인덱스를 반환한다', () => {
    expect(componentMaxIndex({ x: 2, y: 1 })).toBe(0);
    expect(componentMaxIndex({ x: 1, y: 2 })).toBe(1);
  });

  test('두 성분이 같으면 인덱스 0(x 우선)을 반환한다', () => {
    expect(componentMinIndex({ x: 3, y: 3 })).toBe(0);
    expect(componentMaxIndex({ x: 3, y: 3 })).toBe(0);
  });

  test('componentMinEntry / componentMaxEntry는 key literal을 반환한다', () => {
    expect(componentMinEntry({ x: 1, y: 2 })).toBe('x');
    expect(componentMinEntry({ x: 2, y: 1 })).toBe('y');
    expect(componentMaxEntry({ x: 1, y: 2 })).toBe('y');
    expect(componentMaxEntry({ x: 2, y: 1 })).toBe('x');
    expect(componentMinEntry({ x: 3, y: 3 })).toBe('x');
    expect(componentMaxEntry({ x: 3, y: 3 })).toBe('x');
  });

  test('한 성분만 NaN이면 그 성분의 위치를 반환한다', () => {
    expect(componentMinIndex({ x: Number.NaN, y: 1 })).toBe(0);
    expect(componentMinIndex({ x: 1, y: Number.NaN })).toBe(1);
    expect(componentMaxIndex({ x: Number.NaN, y: 1 })).toBe(0);
    expect(componentMaxIndex({ x: 1, y: Number.NaN })).toBe(1);
    expect(componentMinEntry({ x: 1, y: Number.NaN })).toBe('y');
    expect(componentMaxEntry({ x: Number.NaN, y: 1 })).toBe('x');
  });

  test('두 성분이 모두 NaN이면 x 위치를 반환한다', () => {
    expect(componentMinIndex({ x: Number.NaN, y: Number.NaN })).toBe(0);
    expect(componentMaxIndex({ x: Number.NaN, y: Number.NaN })).toBe(0);
    expect(componentMinEntry({ x: Number.NaN, y: Number.NaN })).toBe('x');
    expect(componentMaxEntry({ x: Number.NaN, y: Number.NaN })).toBe('x');
  });

  test('signed zero는 Math.min / Math.max 결과 성분을 가리킨다', () => {
    // Math.min(+0, -0) = -0 → y, Math.max(+0, -0) = +0 → x.
    expect(componentMinIndex({ x: 0, y: -0 })).toBe(1);
    expect(componentMinIndex({ x: -0, y: 0 })).toBe(0);
    expect(componentMaxIndex({ x: 0, y: -0 })).toBe(0);
    expect(componentMaxIndex({ x: -0, y: 0 })).toBe(1);
    expect(componentMinEntry({ x: 0, y: -0 })).toBe('y');
    expect(componentMaxEntry({ x: 0, y: -0 })).toBe('x');
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
      const point = { x: c[0], y: c[1] };
      expect(Object.is(c[componentMinIndex(point)], componentMin(point))).toBe(true);
      expect(Object.is(c[componentMaxIndex(point)], componentMax(point))).toBe(true);
    }
  });
});
