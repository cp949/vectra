/**
 * bounds.transform — `transformInto`의 companion이다. 새 plain BoundsWritable을 반환한다.
 */
import { describe, expect, test } from 'vitest';
import { transform } from '../../../src/bounds/transform';

describe('bounds - transform companion', () => {
  test('translate matrix를 적용한 새 bounds를 반환한다', () => {
    const result = transform({ minX: 1, minY: 2, maxX: 5, maxY: 6 }, { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: -3 });
    expect(result).toEqual({ minX: 11, minY: -1, maxX: 15, maxY: 3 });
  });

  test('empty bounds에서 sentinel을 반환한다', () => {
    const result = transform({ minX: 5, minY: 5, maxX: 0, maxY: 0 }, { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 });
    expect(result).toEqual({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  });
});
