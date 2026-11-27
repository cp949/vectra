/**
 * matrixFrom이 행렬을 독립된 객체로 복사하는지 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { matrixFrom } from '../../../src/matrix/matrix-from';

describe('matrixFrom', () => {
  test('object matrix의 6개 component를 새 객체로 복사한다', () => {
    const source = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    const result = matrixFrom(source);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
    expect(result).not.toBe(source);
  });

  test('결과를 바꿔도 source는 바뀌지 않는다', () => {
    const source = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    const result = matrixFrom(source);
    result.tx = 99;
    expect(source.tx).toBe(5);
  });
});
