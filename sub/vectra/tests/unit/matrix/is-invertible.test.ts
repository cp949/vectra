import { describe, expect, test } from 'vitest';
import { determinant } from '../../../src/matrix/determinant';
import { isInvertible } from '../../../src/matrix/is-invertible';

describe('matrix query - isInvertible', () => {
  test('identity matrix는 invertible이다', () => {
    expect(isInvertible({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(true);
  });

  test('singular matrix (det = 0)는 invertible이 아니다', () => {
    expect(isInvertible({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 })).toBe(false);
  });

  test('det = 0 exact check 기본 동작', () => {
    // a=1, b=2, c=3, d=6 → det = 1*6 - 2*3 = 0
    expect(isInvertible({ a: 1, b: 2, c: 3, d: 6, tx: 0, ty: 0 })).toBe(false);
  });

  test('epsilon 기반 판정: |det| <= epsilon이면 false를 반환한다', () => {
    // a=1e-10, b=0, c=0, d=1 → det = 1e-10 (exact)
    const m = { a: 1e-10, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    expect(determinant(m)).toBe(1e-10);
    // 1e-10 <= 1e-9 → isInvertible false
    expect(isInvertible(m, 1e-9)).toBe(false);
  });

  test('epsilon 기반 판정: |det| > epsilon이면 true를 반환한다', () => {
    const m = { a: 2, b: 0, c: 0, d: 2, tx: 0, ty: 0 };
    // det = 4
    expect(isInvertible(m, 1e-9)).toBe(true);
  });

  test('음수 determinant matrix는 invertible이다', () => {
    // a=-1, b=0, c=0, d=1 → det = -1
    expect(isInvertible({ a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(true);
  });
});
