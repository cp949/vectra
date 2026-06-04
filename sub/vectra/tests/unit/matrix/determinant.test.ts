import { describe, expect, test } from 'vitest';
import { determinant } from '../../../src/matrix/determinant';
import { rotationMatrixInto } from '../../../src/matrix/rotation-matrix-into';
import { makeMatrix } from './_matrix-test-helpers';

describe('matrix scalar query - determinant', () => {
  test('identity matrix의 determinant는 1이다', () => {
    expect(determinant({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(1);
  });

  test('uniform scale S(3,3)의 determinant는 9이다', () => {
    // det = a*d - b*c = 3*3 - 0*0 = 9
    expect(determinant({ a: 3, b: 0, c: 0, d: 3, tx: 0, ty: 0 })).toBe(9);
  });

  test('non-uniform scale S(2,4)의 determinant는 8이다', () => {
    expect(determinant({ a: 2, b: 0, c: 0, d: 4, tx: 0, ty: 0 })).toBe(8);
  });

  test('rotation matrix의 determinant는 1에 가깝다', () => {
    const out = makeMatrix();
    rotationMatrixInto(out, Math.PI / 4);
    expect(determinant(out)).toBeCloseTo(1, 12);
  });

  test('singular matrix (zero scale)의 determinant는 0이다', () => {
    expect(determinant({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 })).toBe(0);
  });

  test('translation은 determinant에 영향을 주지 않는다', () => {
    expect(determinant({ a: 1, b: 0, c: 0, d: 1, tx: 100, ty: 200 })).toBe(1);
  });

  test('음수 scale S(-1, 1)의 determinant는 -1이다', () => {
    expect(determinant({ a: -1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })).toBe(-1);
  });

  test('일반 matrix a*d - b*c를 계산한다', () => {
    // a=2, b=3, c=4, d=5 → det = 2*5 - 3*4 = 10 - 12 = -2
    expect(determinant({ a: 2, b: 3, c: 4, d: 5, tx: 0, ty: 0 })).toBe(-2);
  });

  test('tuple matrix의 determinant를 계산한다', () => {
    expect(determinant([2, 3, 4, 5, 0, 0])).toBe(-2);
  });
});
