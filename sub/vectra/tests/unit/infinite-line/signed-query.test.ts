/**
 * infinite-line signed query 단위 테스트.
 *
 * signedDistanceToPoint, side의 좌/우 부호 규약, non-unit/negative direction
 * 거동, degenerate 입력 처리, NaN/Infinity 전파 정책, side 반환 literal union
 * 타입을 함께 다룬다.
 */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { side } from '../../../src/infinite-line/side';
import { signedDistanceToPoint } from '../../../src/infinite-line/signed-distance-to-point';

describe('infinite-line signed query - signedDistanceToPoint', () => {
  test('direction (1,0), point 좌측 (0,1) → 양수 1.0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: 1 })).toBe(1.0);
  });

  test('direction (1,0), point 우측 (0,-1) → 음수 -1.0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: -1 })).toBe(-1.0);
  });

  test('direction (1,0), point on line (5,0) → 0.0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 5, y: 0 })).toBe(0.0);
  });

  test('non-unit direction (2,0)에서 동일한 point의 부호와 크기가 (1,0)과 동일하다', () => {
    const line2 = { origin: { x: 0, y: 0 }, direction: { x: 2, y: 0 } };
    expect(signedDistanceToPoint(line2, { x: 0, y: 1 })).toBe(1.0);
    expect(signedDistanceToPoint(line2, { x: 0, y: -1 })).toBe(-1.0);
  });

  test('음수 direction (-1,0): 부호가 반전된다', () => {
    const lineNeg = { origin: { x: 0, y: 0 }, direction: { x: -1, y: 0 } };
    // direction이 반전되면 좌/우가 바뀐다
    expect(signedDistanceToPoint(lineNeg, { x: 0, y: 1 })).toBe(-1.0);
    expect(signedDistanceToPoint(lineNeg, { x: 0, y: -1 })).toBe(1.0);
  });

  test('degenerate line (direction=(0,0)): unsigned 거리(양수)를 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    const result = signedDistanceToPoint(line, { x: 3, y: 4 });
    expect(result).toBe(5); // unsigned 3-4-5 거리
    expect(result).toBeGreaterThan(0);
  });

  test('non-finite: point에 NaN이 포함되면 NaN을 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: Number.NaN, y: 0 })).toBeNaN();
    expect(signedDistanceToPoint(line, { x: 0, y: Number.NaN })).toBeNaN();
  });

  test('Infinity point: 부호 있는 Infinity를 pass-through한다 (y축 양쪽)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: Number.POSITIVE_INFINITY })).toBe(Number.POSITIVE_INFINITY);
    expect(signedDistanceToPoint(line, { x: 0, y: Number.NEGATIVE_INFINITY })).toBe(Number.NEGATIVE_INFINITY);
  });

  test('Infinity point.x: dy=0이면 0*Infinity = NaN 전파', () => {
    // direction (1,0): cross = dx*py - dy*(px-ox) = 1*0 - 0*Infinity = NaN
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: Number.POSITIVE_INFINITY, y: 0 })).toBeNaN();
  });

  test('line.direction에 NaN이 포함되면 NaN을 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: Number.NaN, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: 1 })).toBeNaN();
  });

  test('line.direction에 Infinity가 포함되면 NaN을 반환한다 (lenSq=Infinity → cross/Infinity)', () => {
    // direction = (Infinity, 0): cross = Infinity*1 - 0*0 = Infinity, sqrt(lenSq) = Infinity → Infinity/Infinity = NaN
    const line = { origin: { x: 0, y: 0 }, direction: { x: Number.POSITIVE_INFINITY, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: 1 })).toBeNaN();
  });

  test('line.origin에 NaN이 포함되면 NaN을 반환한다', () => {
    const line = { origin: { x: Number.NaN, y: 0 }, direction: { x: 1, y: 0 } };
    expect(signedDistanceToPoint(line, { x: 0, y: 1 })).toBeNaN();
  });

  test('tuple infinite-line input을 읽는다', () => {
    expect(
      signedDistanceToPoint(
        [
          [0, 0],
          [1, 0],
        ] as const,
        [0, 1]
      )
    ).toBe(1.0);
  });
});

describe('infinite-line signed query - side', () => {
  test('좌측 point → 1', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: 1 })).toBe(1);
  });

  test('우측 point → -1', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: -1 })).toBe(-1);
  });

  test('line 위 point (기본 epsilon 안) → 0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 5, y: 0 })).toBe(0);
    expect(side(line, { x: 5, y: 1e-10 })).toBe(0);
  });

  test('기본 epsilon 경계에서: dist = 1e-9 → 0 (<=)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: 1e-9 })).toBe(0);
  });

  test('기본 epsilon 밖: dist = 2e-9 → 1', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: 2e-9 })).toBe(1);
  });

  test('custom epsilon: dist = 0.5, epsilon = 0.5 → 0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: 0.5 }, 0.5)).toBe(0);
    expect(side(line, { x: 0, y: 0.5 }, 0.4)).toBe(1);
  });

  test('degenerate line → 0', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    // degenerate signedDistanceToPoint는 unsigned 거리(양수)를 반환하므로
    // early-return이 없으면 1이 나올 수 있다
    expect(side(line, { x: 3, y: 4 })).toBe(0);
    expect(side(line, { x: 0, y: 0 })).toBe(0);
  });

  test('NaN point → 0 (NaN pass-through 관례 예외)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: Number.NaN, y: 0 })).toBe(0);
    expect(side(line, { x: 0, y: Number.NaN })).toBe(0);
  });

  test('NaN direction → 0 (NaN guard)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: Number.NaN, y: 0 } };
    expect(side(line, { x: 0, y: 1 })).toBe(0);
  });

  test('NaN origin → 0 (NaN guard)', () => {
    const line = { origin: { x: Number.NaN, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: 1 })).toBe(0);
  });

  test('Infinity direction → signedDistance NaN → 0', () => {
    // direction = (Infinity, 0): signedDistanceToPoint가 NaN을 반환 → side 0
    const line = { origin: { x: 0, y: 0 }, direction: { x: Number.POSITIVE_INFINITY, y: 0 } };
    expect(side(line, { x: 0, y: 1 })).toBe(0);
  });

  test('Infinity point → 1 또는 -1 (유효한 대소 비교)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(side(line, { x: 0, y: Number.POSITIVE_INFINITY })).toBe(1);
    expect(side(line, { x: 0, y: Number.NEGATIVE_INFINITY })).toBe(-1);
  });

  test('반환 타입이 -1 | 0 | 1 literal union이다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expectTypeOf(side(line, { x: 0, y: 1 })).toEqualTypeOf<-1 | 0 | 1>();
  });

  test('tuple infinite-line input을 읽는다', () => {
    expect(
      side(
        [
          [0, 0],
          [1, 0],
        ] as const,
        [0, 1]
      )
    ).toBe(1);
  });
});
