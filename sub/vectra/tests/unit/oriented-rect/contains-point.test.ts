/** 회전 사각형의 닫힌 경계와 점 포함 판정을 검증한다. */
import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/oriented-rect/contains-point';
import type { OrientedRect } from '../../../src/types/flat-shapes.internal';

// center (0,0), size 4×2 (hw=2, hh=1), angle 0
const flat: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

describe('containsPoint - angle 0', () => {
  test('center는 true', () => {
    expect(containsPoint(flat, { x: 0, y: 0 })).toBe(true);
  });

  test('내부점은 true', () => {
    expect(containsPoint(flat, { x: 1, y: 0.5 })).toBe(true);
  });

  test('edge 위 point는 closed boundary로 true', () => {
    expect(containsPoint(flat, { x: 2, y: 0 })).toBe(true);
    expect(containsPoint(flat, { x: 0, y: 1 })).toBe(true);
  });

  test('corner 위 point는 closed boundary로 true', () => {
    expect(containsPoint(flat, { x: 2, y: 1 })).toBe(true);
    expect(containsPoint(flat, { x: -2, y: -1 })).toBe(true);
  });

  test('x extent 밖 point는 false', () => {
    expect(containsPoint(flat, { x: 2.0001, y: 0 })).toBe(false);
  });

  test('y extent 밖 point는 false', () => {
    expect(containsPoint(flat, { x: 0, y: 1.5 })).toBe(false);
  });

  test('center offset을 반영한다', () => {
    const rect: OrientedRect = { cx: 3, cy: 5, width: 4, height: 2, angle: 0 };
    expect(containsPoint(rect, { x: 3, y: 5 })).toBe(true);
    expect(containsPoint(rect, { x: 5, y: 6 })).toBe(true);
    expect(containsPoint(rect, { x: 0, y: 5 })).toBe(false);
  });
});

describe('containsPoint - 회전', () => {
  // size 4×2 rect를 90도 회전 → world-y 방향으로 hw=2, world-x 방향으로 hh=1
  const rotated: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 };

  test('local-space 내부점은 true', () => {
    // world (0, 1.5)는 localX=1.5, localY≈0 → 내부
    expect(containsPoint(rotated, { x: 0, y: 1.5 })).toBe(true);
    // world (0.9, 0)은 localY≈-0.9 → 내부
    expect(containsPoint(rotated, { x: 0.9, y: 0 })).toBe(true);
  });

  test('local-space 외부점은 false', () => {
    // world (0, 2.5)는 localX=2.5 > hw=2 → 외부
    expect(containsPoint(rotated, { x: 0, y: 2.5 })).toBe(false);
    // world (1.5, 0)은 localY≈-1.5 > hh=1 → 외부
    expect(containsPoint(rotated, { x: 1.5, y: 0 })).toBe(false);
  });

  test('45도 회전 정사각형 local containment', () => {
    // size 2×2 정사각형을 45도 회전. world 대각선 끝 (√2, 0)은 boundary 근처 → 내부
    const square: OrientedRect = { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 };
    expect(containsPoint(square, { x: 1, y: 0 })).toBe(true);
    // 대각 꼭짓점 밖 (1.5, 1.5)는 외부
    expect(containsPoint(square, { x: 1.5, y: 1.5 })).toBe(false);
  });
});

describe('containsPoint - empty size', () => {
  test('width === 0은 false', () => {
    const rect: OrientedRect = { cx: 0, cy: 0, width: 0, height: 2, angle: 0 };
    expect(containsPoint(rect, { x: 0, y: 0 })).toBe(false);
  });

  test('height < 0은 false', () => {
    const rect: OrientedRect = { cx: 0, cy: 0, width: 4, height: -2, angle: 0 };
    expect(containsPoint(rect, { x: 0, y: 0 })).toBe(false);
  });
});

describe('containsPoint - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => containsPoint({ cx: 0, cy: 0, width: NaN, height: 2, angle: 0 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() => containsPoint({ cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => containsPoint({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });
});

describe('containsPoint - center non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 false', () => {
    // dx = px - Infinity = -Infinity → localX 비교가 false
    expect(() => containsPoint({ cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).not.toThrow();
    expect(containsPoint({ cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('cy NaN은 throw 없이 false', () => {
    // dy = py - NaN = NaN → 비교가 false
    expect(containsPoint({ cx: 0, cy: NaN, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('point.x Infinity는 throw 없이 false', () => {
    // dx = Infinity → localX 비교가 false
    expect(containsPoint(flat, { x: Infinity, y: 0 })).toBe(false);
  });

  test('point.y NaN은 throw 없이 false', () => {
    // dy = NaN → 비교가 false
    expect(containsPoint(flat, { x: 0, y: NaN })).toBe(false);
  });

  test('cx -Infinity는 throw 없이 false', () => {
    // dx = px - (-Infinity) = Infinity → localX 비교가 false
    expect(containsPoint({ cx: -Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 })).toBe(false);
  });

  test('point.y -Infinity는 throw 없이 false', () => {
    // angle 0이라 sin=0 → localX = dy*sin = -Infinity*0 = NaN → 비교가 false
    expect(containsPoint(flat, { x: 0, y: -Infinity })).toBe(false);
  });
});
