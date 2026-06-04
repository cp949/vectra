import { describe, expect, test } from 'vitest';
import { nearEquals } from '../../../src/matrix/near-equals';

describe('matrix query - nearEquals', () => {
  test('동일 component는 true를 반환한다', () => {
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(nearEquals(m, m)).toBe(true);
  });

  test('epsilon 이하 차이는 true를 반환한다 (기본 epsilon = 1e-9)', () => {
    const eps = 1e-10;
    expect(nearEquals({ a: 1 + eps, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(
      true
    );
  });

  test('epsilon 초과 차이는 false를 반환한다', () => {
    const eps = 1e-8;
    expect(nearEquals({ a: 1 + eps, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(
      false
    );
  });

  test('명시적 epsilon으로 판정한다', () => {
    const m1 = { a: 1, b: 0.005, c: 0, d: 1, tx: 0, ty: 0 };
    const m2 = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(nearEquals(m1, m2, 0.01)).toBe(true);
    expect(nearEquals(m1, m2, 0.001)).toBe(false);
  });

  test('모든 component의 차이를 검사한다', () => {
    const base = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    // epsilon보다 큰 차이(2e-9 > 1e-9)는 false이다
    const diff = 2e-9;
    expect(nearEquals({ ...base, tx: base.tx + diff }, base, 1e-9)).toBe(false);
    expect(nearEquals({ ...base, ty: base.ty + diff }, base, 1e-9)).toBe(false);
  });

  test('epsilon = 0이면 exact equality와 동일하다', () => {
    const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(nearEquals(m, m, 0)).toBe(true);
    expect(nearEquals(m, { a: 1 + Number.EPSILON, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, 0)).toBe(false);
  });
});
