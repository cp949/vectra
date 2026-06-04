/**
 * bounds.transform — `transformInto`의 companion이다. 새 plain BoundsWritable을 반환한다.
 *
 * 검증: 새 object 반환, transformInto와 결과 일치, input mutation 없음.
 */
import { describe, expect, test } from 'vitest';
import { transform } from '../../../src/bounds/transform';
import { transformInto } from '../../../src/bounds/transform-into';
import type { BoundsWritable } from '../../../src/types';

describe('bounds - transform companion', () => {
  test('새 plain object {min, max}를 반환한다', () => {
    const result = transform({ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(result).toEqual({ min: { x: 11, y: -1 }, max: { x: 15, y: 3 } });
  });

  test('호출마다 새 object 인스턴스를 반환한다', () => {
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    const bounds = { min: { x: 0, y: 0 }, max: { x: 1, y: 1 } };
    const a = transform(bounds, matrix);
    const b = transform(bounds, matrix);
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(b.min);
    expect(a.max).not.toBe(b.max);
  });

  test('translate matrix에서 transformInto와 동일한 결과를 낸다', () => {
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    const matrix = { a: 1, b: 0, c: 0, d: 1, tx: 7, ty: -2 };
    const expected: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    transformInto(expected, bounds, matrix);
    expect(transform(bounds, matrix)).toEqual(expected);
  });

  test('rotation matrix에서 transformInto와 동일한 결과를 낸다', () => {
    const bounds = { min: { x: 0, y: 0 }, max: { x: 2, y: 4 } };
    const matrix = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
    const expected: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    transformInto(expected, bounds, matrix);
    const result = transform(bounds, matrix);
    expect(result.min.x).toBeCloseTo(expected.min.x);
    expect(result.min.y).toBeCloseTo(expected.min.y);
    expect(result.max.x).toBeCloseTo(expected.max.x);
    expect(result.max.y).toBeCloseTo(expected.max.y);
  });

  test('empty bounds에서 sentinel을 반환한다', () => {
    const result = transform({ min: { x: 5, y: 5 }, max: { x: 0, y: 0 } }, { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
    expect(result.min).toEqual({ x: Infinity, y: Infinity });
    expect(result.max).toEqual({ x: -Infinity, y: -Infinity });
  });

  test('input bounds를 mutate하지 않는다', () => {
    const bounds = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    const snapshot = { min: { x: 1, y: 2 }, max: { x: 5, y: 6 } };
    transform(bounds, { a: 2, b: 0, c: 0, d: 2, tx: 10, ty: 10 });
    expect(bounds).toEqual(snapshot);
  });

  test('input matrix를 mutate하지 않는다', () => {
    const matrix = { a: 2, b: 0, c: 0, d: 2, tx: 10, ty: 10 };
    const snapshot = { a: 2, b: 0, c: 0, d: 2, tx: 10, ty: 10 };
    transform({ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, matrix);
    expect(matrix).toEqual(snapshot);
  });
});
