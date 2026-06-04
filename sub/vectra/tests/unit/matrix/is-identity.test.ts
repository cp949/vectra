import { describe, expect, test } from 'vitest';
import { isIdentity } from '../../../src/matrix/is-identity';

describe('matrix query - isIdentity', () => {
  test('identity matrix는 true를 반환한다', () => {
    expect(isIdentity({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(true);
  });

  test('non-identity는 false를 반환한다', () => {
    expect(isIdentity({ a: 2, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
    expect(isIdentity({ a: 1, b: 0, c: 0, d: 1, tx: 1, ty: 0 })).toBe(false);
  });

  test('epsilon 이하 차이는 true를 반환한다', () => {
    const eps = 1e-10;
    expect(isIdentity({ a: 1 + eps, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, 1e-9)).toBe(true);
  });

  test('epsilon 초과 차이는 false를 반환한다', () => {
    const eps = 1e-8;
    expect(isIdentity({ a: 1 + eps, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, 1e-9)).toBe(false);
  });

  test('기본 epsilon = 0이면 exact check이다', () => {
    const tiny = Number.EPSILON;
    expect(isIdentity({ a: 1 + tiny, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('b component 차이도 검사한다', () => {
    expect(isIdentity({ a: 1, b: 1e-10, c: 0, d: 1, tx: 0, ty: 0 }, 1e-9)).toBe(true);
    expect(isIdentity({ a: 1, b: 1e-8, c: 0, d: 1, tx: 0, ty: 0 }, 1e-9)).toBe(false);
  });

  test('tx/ty component 차이도 검사한다', () => {
    expect(isIdentity({ a: 1, b: 0, c: 0, d: 1, tx: 1e-10, ty: 0 }, 1e-9)).toBe(true);
    expect(isIdentity({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 1e-8 }, 1e-9)).toBe(false);
  });
});
