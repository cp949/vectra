/**
 * triangle 면적, 방향, degenerate 판정을 검증한다.
 * signed/absolute area, CW/CCW orientation, epsilon 정책을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { area } from '../../../src/triangle/area';
import { isClockwise } from '../../../src/triangle/is-clockwise';
import { isCounterClockwise } from '../../../src/triangle/is-counter-clockwise';
import { isDegenerate } from '../../../src/triangle/is-degenerate';
import { signedArea } from '../../../src/triangle/signed-area';

describe('signedArea', () => {
  test('CCW triangle: signedArea가 양수다', () => {
    // a(0,0) → b(4,0) → c(0,3): 반시계 방향
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(signedArea(t)).toBeGreaterThan(0);
  });

  test('CCW triangle: signedArea 값이 정확하다 (0.5 * base * height)', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    // area = 0.5 * 4 * 3 = 6
    expect(signedArea(t)).toBe(6);
  });

  test('CW triangle: signedArea가 음수다', () => {
    // a(0,0) → b(0,3) → c(4,0): 시계 방향
    const t = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(signedArea(t)).toBeLessThan(0);
  });

  test('CW triangle: signedArea가 정확한 음수 값을 반환한다', () => {
    // a(0,0) → b(0,3) → c(4,0): CCW와 같은 삼각형을 역순으로 → -6
    const t = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(signedArea(t)).toBe(-6);
  });

  test('degenerate collinear triangle: signedArea가 0이다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(signedArea(t)).toBe(0);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    expect(signedArea(t)).toBe(6);
  });
});

describe('area', () => {
  test('CCW triangle: area가 양수다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(area(t)).toBe(6);
  });

  test('CW triangle: area가 CCW와 같은 절댓값이다', () => {
    const ccw = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    const cw = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(area(ccw)).toBe(area(cw));
  });

  test('degenerate collinear triangle: area가 0이다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(area(t)).toBe(0);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    expect(area(t)).toBe(6);
  });
});

describe('isClockwise', () => {
  test('CW triangle: true를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(isClockwise(t)).toBe(true);
  });

  test('CCW triangle: false를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isClockwise(t)).toBe(false);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(isClockwise(t)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 0, y: 3 },
      { x: 4, y: 0 },
    ] as const;
    expect(isClockwise(t)).toBe(true);
  });
});

describe('isCounterClockwise', () => {
  test('CCW triangle: true를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isCounterClockwise(t)).toBe(true);
  });

  test('CW triangle: false를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 0, y: 3 }, c: { x: 4, y: 0 } };
    expect(isCounterClockwise(t)).toBe(false);
  });

  test('degenerate triangle: false를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(isCounterClockwise(t)).toBe(false);
  });

  test('CW와 CCW는 동시에 true일 수 없다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isClockwise(t) && isCounterClockwise(t)).toBe(false);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ] as const;
    expect(isCounterClockwise(t)).toBe(true);
  });
});

describe('isDegenerate', () => {
  test('collinear triangle: true를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    expect(isDegenerate(t)).toBe(true);
  });

  test('반복 vertex: true를 반환한다', () => {
    const t = { a: { x: 1, y: 1 }, b: { x: 1, y: 1 }, c: { x: 3, y: 4 } };
    expect(isDegenerate(t)).toBe(true);
  });

  test('정상 triangle: false를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isDegenerate(t)).toBe(false);
  });

  test('Infinity 좌표: true를 반환한다', () => {
    const t = { a: { x: Infinity, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isDegenerate(t)).toBe(true);
  });

  test('NaN 좌표: true를 반환한다', () => {
    const t = { a: { x: 0, y: Number.NaN }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(isDegenerate(t)).toBe(true);
  });

  test('-Infinity 좌표: true를 반환한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: -Infinity, y: 0 }, c: { x: 0, y: 3 } };
    expect(isDegenerate(t)).toBe(true);
  });

  test('epsilon=0(기본): area===0인 triangle만 degenerate', () => {
    // area = 0.5인 매우 작은 triangle
    const t = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, c: { x: 0, y: 1 } };
    expect(isDegenerate(t)).toBe(false);
    expect(isDegenerate(t, 0)).toBe(false);
  });

  test('epsilon 지정: area가 epsilon 이하이면 degenerate', () => {
    // area = 0.5 * 1 * 1 = 0.5
    const t = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, c: { x: 0, y: 1 } };
    expect(isDegenerate(t, 0.5)).toBe(true);
    expect(isDegenerate(t, 0.49)).toBe(false);
  });

  test('epsilon < 0: RangeError를 throw한다', () => {
    const t = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 3 } };
    expect(() => isDegenerate(t, -1)).toThrow(RangeError);
  });

  test('tuple input도 처리한다', () => {
    const t = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
    ] as const;
    expect(isDegenerate(t)).toBe(true);
  });
});
