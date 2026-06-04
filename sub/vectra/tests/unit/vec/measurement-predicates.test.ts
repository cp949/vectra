/**
 * 벡터 상태 판별 함수 테스트.
 * isFinite, hasNan, isZero, isUnit 의 boolean 반환 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { hasNan } from '../../../src/vec/has-nan';
import { isFinite as isFiniteVec } from '../../../src/vec/is-finite';
import { isUnit } from '../../../src/vec/is-unit';
import { isZero } from '../../../src/vec/is-zero';

describe('vec measurement - isFinite', () => {
  test('일반 벡터는 true를 반환한다', () => {
    expect(isFiniteVec({ x: 1, y: 2 })).toBe(true);
  });

  test('tuple 입력도 true를 반환한다', () => {
    expect(isFiniteVec([0, -5])).toBe(true);
  });

  test('x가 Infinity이면 false를 반환한다', () => {
    expect(isFiniteVec({ x: Infinity, y: 0 })).toBe(false);
  });

  test('y가 -Infinity이면 false를 반환한다', () => {
    expect(isFiniteVec([0, -Infinity])).toBe(false);
  });

  test('x가 NaN이면 false를 반환한다', () => {
    expect(isFiniteVec({ x: NaN, y: 0 })).toBe(false);
  });

  test('zero vector는 true를 반환한다', () => {
    expect(isFiniteVec([0, 0])).toBe(true);
  });
});

describe('vec measurement - hasNan', () => {
  test('일반 벡터는 false를 반환한다', () => {
    expect(hasNan({ x: 1, y: 2 })).toBe(false);
  });

  test('x가 NaN이면 true를 반환한다', () => {
    expect(hasNan({ x: NaN, y: 0 })).toBe(true);
  });

  test('y가 NaN이면 true를 반환한다', () => {
    expect(hasNan([0, NaN])).toBe(true);
  });

  test('둘 다 NaN이면 true를 반환한다', () => {
    expect(hasNan({ x: NaN, y: NaN })).toBe(true);
  });

  test('Infinity는 NaN이 아니므로 false를 반환한다', () => {
    expect(hasNan([Infinity, -Infinity])).toBe(false);
  });

  test('zero vector는 false를 반환한다', () => {
    expect(hasNan({ x: 0, y: 0 })).toBe(false);
  });
});

describe('vec measurement - isZero', () => {
  test('zero vector는 true를 반환한다', () => {
    expect(isZero([0, 0])).toBe(true);
  });

  test('object zero vector는 true를 반환한다', () => {
    expect(isZero({ x: 0, y: 0 })).toBe(true);
  });

  test('일반 벡터는 false를 반환한다', () => {
    expect(isZero([1, 0])).toBe(false);
  });

  test('epsilon 내의 작은 벡터는 true를 반환한다', () => {
    expect(isZero([1e-10, 0])).toBe(true);
  });

  test('사용자 epsilon보다 큰 벡터는 false를 반환한다', () => {
    expect(isZero([0.1, 0], 0.05)).toBe(false);
  });

  test('사용자 epsilon 내의 벡터는 true를 반환한다', () => {
    expect(isZero([0.03, 0.04], 0.1)).toBe(true);
  });

  test('NaN 좌표가 포함된 입력은 false를 반환한다', () => {
    expect(isZero([Number.NaN, 0])).toBe(false);
    expect(isZero({ x: 0, y: Number.NaN })).toBe(false);
  });
});

describe('vec measurement - isUnit', () => {
  test('단위 벡터는 true를 반환한다', () => {
    expect(isUnit([1, 0])).toBe(true);
  });

  test('object 단위 벡터는 true를 반환한다', () => {
    expect(isUnit({ x: 0, y: -1 })).toBe(true);
  });

  test('길이 2인 벡터는 false를 반환한다', () => {
    expect(isUnit([2, 0])).toBe(false);
  });

  test('zero vector는 false를 반환한다', () => {
    expect(isUnit([0, 0])).toBe(false);
  });

  test('대각선 단위 벡터는 true를 반환한다', () => {
    const v = 1 / Math.SQRT2;

    expect(isUnit([v, v])).toBe(true);
  });

  test('사용자 epsilon으로 근사 단위 벡터를 허용한다', () => {
    // 길이가 1.001인 벡터
    expect(isUnit([1.001, 0], 0.01)).toBe(true);
  });

  test('NaN 좌표가 포함된 입력은 false를 반환한다', () => {
    expect(isUnit([Number.NaN, 0])).toBe(false);
    expect(isUnit({ x: 1, y: Number.NaN })).toBe(false);
  });
});
