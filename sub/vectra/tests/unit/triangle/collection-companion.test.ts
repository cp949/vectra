import { describe, expect, test } from 'vitest';
import { excenters } from '../../../src/triangle/excenters';
import { excentersInto } from '../../../src/triangle/excenters-into';
import { excircles } from '../../../src/triangle/excircles';
import { excirclesInto } from '../../../src/triangle/excircles-into';
import { interiorAngles } from '../../../src/triangle/interior-angles';
import { interiorAnglesInto } from '../../../src/triangle/interior-angles-into';

/** 3-4-5 직각삼각형 */
const right345 = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 }, c: { x: 0, y: 4 } };
/** collinear(degenerate) */
const collinear = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

describe('triangle.interiorAngles — 새 배열 반환', () => {
  test('Into와 동일한 3개 내각을 반환한다', () => {
    const out: number[] = [];
    interiorAnglesInto(out, right345);
    expect(interiorAngles(right345)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = interiorAngles(right345);
    const result2 = interiorAngles(right345);
    expect(result1).not.toBe(result2);
  });

  test('3개 내각의 합이 π이다', () => {
    const result = interiorAngles(right345);
    expect(result).toHaveLength(3);
    expect(result[0] + result[1] + result[2]).toBeCloseTo(Math.PI, 10);
  });

  test('collinear triangle에서도 3개 내각을 반환한다', () => {
    expect(interiorAngles(collinear)).toHaveLength(3);
  });
});

describe('triangle.excenters — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    excentersInto(out, right345);
    expect(excenters(right345)).toEqual(out);
  });

  test('유효한 triangle에서 3개 방심을 반환한다', () => {
    expect(excenters(right345)).toHaveLength(3);
  });

  test('새 배열을 반환한다', () => {
    const result1 = excenters(right345);
    const result2 = excenters(right345);
    expect(result1).not.toBe(result2);
  });

  test('degenerate triangle에서 undefined가 아닌 빈 배열을 반환한다', () => {
    const result = excenters(collinear);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });

  test('non-finite vertex에서 빈 배열을 반환한다', () => {
    const t = { a: { x: Infinity, y: 0 }, b: { x: 0, y: 1 }, c: { x: 1, y: 0 } };
    expect(excenters(t)).toEqual([]);
  });
});

describe('triangle.excircles — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: { center: { x: number; y: number }; radius: number }[] = [];
    excirclesInto(out, right345);
    expect(excircles(right345)).toEqual(out);
  });

  test('유효한 triangle에서 3개 방접원을 반환한다', () => {
    expect(excircles(right345)).toHaveLength(3);
  });

  test('새 배열을 반환한다', () => {
    const result1 = excircles(right345);
    const result2 = excircles(right345);
    expect(result1).not.toBe(result2);
  });

  test('degenerate triangle에서 undefined가 아닌 빈 배열을 반환한다', () => {
    const result = excircles(collinear);
    expect(result).toEqual([]);
    expect(result).not.toBeUndefined();
  });

  test('non-finite vertex에서 빈 배열을 반환한다', () => {
    const t = { a: { x: Infinity, y: 0 }, b: { x: 0, y: 1 }, c: { x: 1, y: 0 } };
    expect(excircles(t)).toEqual([]);
  });
});
