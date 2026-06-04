import { describe, expect, test } from 'vitest';
import { equals } from '../../../src/matrix/equals';

describe('matrix query - equals', () => {
  test('동일 component는 true를 반환한다', () => {
    const m = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    expect(equals(m, { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 })).toBe(true);
  });

  test('object matrix와 tuple matrix의 component를 비교한다', () => {
    const m = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    expect(equals(m, [1, 2, 3, 4, 5, 6])).toBe(true);
    expect(equals([1, 2, 3, 4, 5, 7], m)).toBe(false);
  });

  test('같은 object 참조는 true를 반환한다', () => {
    const m = { a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 };
    expect(equals(m, m)).toBe(true);
  });

  test('a가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 2, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('b가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 1, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('c가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 1, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('d가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 2, tx: 0, ty: 0 })).toBe(false);
  });

  test('tx가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 1, tx: 1, ty: 0 })).toBe(false);
  });

  test('ty가 다르면 false를 반환한다', () => {
    expect(equals({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 1 })).toBe(false);
  });

  test('epsilon보다 작은 차이도 exact equality에서는 false를 반환한다', () => {
    const eps = 1e-15;
    expect(equals({ a: 1 + eps, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(
      false
    );
  });
});
