/**
 * `matrixFrom`의 두 오버로드를 검증하는 테스트.
 * `MatrixLike` 하나를 받는 경우와 6개 component를 받는 경우 모두
 * 새 plain object를 반환하고 입력과 겹치지 않는지 본다.
 */
import { describe, expect, test } from 'vitest';
import { matrixFrom } from '../../../src/matrix/matrix-from';

describe('matrixFrom - MatrixLike 오버로드', () => {
  test('object matrix의 6개 component를 새 객체로 복사한다', () => {
    const source = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    const result = matrixFrom(source);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
    expect(result).not.toBe(source);
  });

  test('tuple matrix도 plain object로 복사한다', () => {
    expect(matrixFrom([1, 2, 3, 4, 5, 6] as const)).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
  });

  test('결과를 바꿔도 source는 바뀌지 않는다', () => {
    const source = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    const result = matrixFrom(source);
    result.tx = 99;
    expect(source.tx).toBe(5);
  });
});

describe('matrixFrom - 6개 component 오버로드', () => {
  test('인자 순서대로 a, b, c, d, tx, ty에 기록한다', () => {
    const result = matrixFrom(1, 2, 3, 4, 5, 6);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
  });

  test('0과 음수 component를 그대로 기록한다', () => {
    expect(matrixFrom(0, -1, 1, 0, -7, 0)).toEqual({ a: 0, b: -1, c: 1, d: 0, tx: -7, ty: 0 });
  });

  test('호출마다 새 객체를 반환한다', () => {
    expect(matrixFrom(1, 0, 0, 1, 0, 0)).not.toBe(matrixFrom(1, 0, 0, 1, 0, 0));
  });
});
