/**
 * bounds.transform — `transformInto`의 companion이다. 새 plain BoundsWritable을 반환한다.
 */
import { describe, expect, test } from 'vitest';
import { transform } from '../../../src/bounds/transform';

describe('bounds - transform companion', () => {
  test('translate matrix를 적용한 새 bounds를 반환한다', () => {
    const result = transform({ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(result).toEqual({ min: { x: 11, y: -1 }, max: { x: 15, y: 3 } });
  });

  test('empty bounds에서 sentinel을 반환한다', () => {
    const result = transform({ min: { x: 5, y: 5 }, max: { x: 0, y: 0 } }, { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
    expect(result.min).toEqual({ x: Infinity, y: Infinity });
    expect(result.max).toEqual({ x: -Infinity, y: -Infinity });
  });
});
