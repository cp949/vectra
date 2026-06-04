import { describe, expect, test } from 'vitest';
import { isOrthogonal } from '../../../src/matrix/is-orthogonal';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix query - isOrthogonal', () => {
  test('identity matrix는 orthogonal이다', () => {
    expect(isOrthogonal({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(true);
  });

  test('rotation matrix는 orthogonal이다', () => {
    const out = makeMatrix();
    rotationMatrixInto(out, Math.PI / 4);
    expect(isOrthogonal(out)).toBe(true);
  });

  test('column dot product가 0인 non-uniform scale은 orthogonal이다', () => {
    // (a, b) = (2, 0), (c, d) = (0, 3) → dot = 0
    expect(isOrthogonal({ a: 2, b: 0, c: 0, d: 3, tx: 0, ty: 0 })).toBe(true);
  });

  test('skew matrix는 orthogonal이 아니다', () => {
    // skewX: (a, b) = (1, 0), (c, d) = (tan, 1) → dot = tan ≠ 0
    expect(isOrthogonal({ a: 1, b: 0, c: Math.tan(0.3), d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('translation은 판정에 영향을 주지 않는다', () => {
    expect(isOrthogonal({ a: 1, b: 0, c: 0, d: 1, tx: 100, ty: 200 })).toBe(true);
    expect(isOrthogonal({ a: 1, b: 0, c: Math.tan(0.3), d: 1, tx: 100, ty: 200 })).toBe(false);
  });

  test('기본 epsilon = 0이면 exact orthogonality 판정이다', () => {
    // dot = 1 * 1e-12 = 1e-12 > 0 → false
    expect(isOrthogonal({ a: 1, b: 0, c: 1e-12, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('epsilon 경계: |dot| <= epsilon이면 true', () => {
    // (a, b) = (1, 0), (c, d) = (0.005, 1) → dot = 0.005
    const m = { a: 1, b: 0, c: 0.005, d: 1, tx: 0, ty: 0 };
    expect(isOrthogonal(m, 0.01)).toBe(true);
    expect(isOrthogonal(m, 0.001)).toBe(false);
  });

  test('음수 dot product도 절댓값으로 판정한다', () => {
    // (a, b) = (1, 0), (c, d) = (-0.005, 1) → dot = -0.005
    const m = { a: 1, b: 0, c: -0.005, d: 1, tx: 0, ty: 0 };
    expect(isOrthogonal(m, 0.01)).toBe(true);
    expect(isOrthogonal(m, 0.001)).toBe(false);
  });

  test('tuple matrix input을 판정한다', () => {
    expect(isOrthogonal([1, 0, 0, 1, 0, 0])).toBe(true);
    expect(isOrthogonal([1, 0, Math.tan(0.3), 1, 0, 0])).toBe(false);
  });

  test('NaN component는 orthogonal이 아니다', () => {
    expect(isOrthogonal({ a: Number.NaN, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('Infinity component는 orthogonal이 아니다', () => {
    // dot = Infinity * 1 + 0 = Infinity → Infinity <= 0 false
    expect(isOrthogonal({ a: 1, b: 0, c: Number.POSITIVE_INFINITY, d: 1, tx: 0, ty: 0 })).toBe(false);
    // dot = Infinity * 0 + 0 = NaN → false
    expect(isOrthogonal({ a: Number.POSITIVE_INFINITY, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('-Infinity component는 orthogonal이 아니다', () => {
    // dot = -Infinity * 1 + 0 = -Infinity → |-Infinity| <= 0 false
    expect(isOrthogonal({ a: 1, b: 0, c: Number.NEGATIVE_INFINITY, d: 1, tx: 0, ty: 0 })).toBe(false);
  });

  test('zero matrix는 column dot이 0이므로 orthogonal이다', () => {
    // column 길이(scale)는 판정하지 않으므로 zero column도 dot = 0 → true
    expect(isOrthogonal({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 })).toBe(true);
  });
});
