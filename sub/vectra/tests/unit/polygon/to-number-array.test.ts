/**
 * polygon toNumberArray* adapter helper unit test.
 */

import type { Polygon } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { toNumberArray } from '../../../src/polygon/to-number-array';
import { toNumberArrayInto } from '../../../src/polygon/to-number-array-into';
import { SQUARE, TRIANGLE } from './_bridge-adapter-test-helpers';

describe('polygon bridge - toNumberArrayInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: number[] = [9, 9];
    const result = toNumberArrayInto(out, []);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: number[] = [1, 2, 3, 4, 5];
    toNumberArrayInto(out, TRIANGLE);
    expect(out).toEqual([0, 0, 4, 0, 0, 3]);
  });

  test('triangle을 flat 좌표 배열로 직렬화한다', () => {
    const out: number[] = [];
    toNumberArrayInto(out, TRIANGLE);
    expect(out).toEqual([0, 0, 4, 0, 0, 3]);
  });

  test('square를 flat 좌표 배열로 직렬화한다', () => {
    expect(toNumberArray(SQUARE)).toEqual([0, 0, 2, 0, 2, 2, 0, 2]);
  });

  test('non-finite 좌표를 그대로 통과시킨다', () => {
    const poly: Polygon = [Number.NaN, Number.POSITIVE_INFINITY, -0, 1];
    const out = toNumberArray(poly);
    expect(out[0]).toBeNaN();
    expect(out[1]).toBe(Number.POSITIVE_INFINITY);
    expect(Object.is(out[2], -0)).toBe(true);
    expect(out[3]).toBe(1);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const out: number[] = [];
    toNumberArrayInto(out, SQUARE);
    expect(toNumberArray(SQUARE)).toEqual(out);
  });
});

test('입력과 출력 배열이 같으면 같은 참조와 좌표를 유지한다', () => {
  const polygon = [0, 0, 4, 0, 0, 3];
  expect(toNumberArrayInto(polygon, polygon)).toBe(polygon);
  expect(polygon).toEqual([0, 0, 4, 0, 0, 3]);
});
