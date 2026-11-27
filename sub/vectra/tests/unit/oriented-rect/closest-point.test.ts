/** 회전 사각형 최근접점의 좌표와 실패 반환을 검증한다. */
import { describe, expect, expectTypeOf, test } from 'vitest';
import { closestPoint } from '../../../src/oriented-rect/closest-point';
import { closestPointInto } from '../../../src/oriented-rect/closest-point-into';
import type { OrientedRect, PointWritable } from '../../../src/types/flat-shapes.internal';

/** 최근접점을 기록할 빈 점을 만든다. */
function makeXY(): { x: number; y: number } {
  return { x: 0, y: 0 };
}

// center (0,0), size 4×2 (hw=2, hh=1), angle 0
const flat: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

// ─── closestPointInto ────────────────────────────────────────────────

describe('closestPointInto - angle 0', () => {
  test('내부점은 같은 좌표를 기록하고 true', () => {
    const out = makeXY();
    const result = closestPointInto(out, flat, { x: 1, y: 0.5 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 1, y: 0.5 });
  });

  test('boundary point는 같은 좌표를 기록한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: 2, y: 1 });
    expect(out).toEqual({ x: 2, y: 1 });
  });

  test('오른쪽 외부점은 right edge로 clamp한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: 5, y: 0 });
    expect(out).toEqual({ x: 2, y: 0 });
  });

  test('위쪽 외부점은 top edge로 clamp한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: 0, y: -5 });
    expect(out).toEqual({ x: 0, y: -1 });
  });

  test('diagonal 외부점은 nearest corner로 clamp한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: 5, y: 5 });
    expect(out).toEqual({ x: 2, y: 1 });
  });
});

describe('closestPointInto - 회전', () => {
  // size 4×2 rect를 90도 회전 → world-y 방향으로 hw=2, world-x 방향으로 hh=1
  const rotated: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 };

  test('world-space 외부점을 local clamp 후 되돌린 좌표로 기록한다', () => {
    const out = makeXY();
    // world (0,5)는 local (5,~0) → clamp (2,~0) → world (~0, 2)
    closestPointInto(out, rotated, { x: 0, y: 5 });
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(2, 10);
  });

  test('회전 rect 내부점은 같은 좌표를 기록한다', () => {
    const out = makeXY();
    closestPointInto(out, rotated, { x: 0.5, y: 1 });
    expect(out.x).toBeCloseTo(0.5, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });
});

describe('closestPointInto - aliasing', () => {
  test('out === point aliasing에서도 정의대로 동작한다', () => {
    const point = { x: 5, y: 0 };
    const result = closestPointInto(point, flat, point);
    expect(result).toBe(true);
    expect(point).toEqual({ x: 2, y: 0 });
  });
});

describe('closestPointInto - empty size', () => {
  test('width <= 0은 false와 no mutation', () => {
    const out = { x: 9, y: 9 };
    const result = closestPointInto(out, { cx: 0, cy: 0, width: 0, height: 2, angle: 0 }, { x: 5, y: 0 });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });

  test('height < 0은 false와 no mutation', () => {
    const out = { x: 9, y: 9 };
    const result = closestPointInto(out, { cx: 0, cy: 0, width: 4, height: -2, angle: 0 }, { x: 5, y: 0 });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });
});

describe('closestPointInto - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => closestPointInto(makeXY(), { cx: 0, cy: 0, width: NaN, height: 2, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test('height Infinity이면 RangeError', () => {
    expect(() =>
      closestPointInto(makeXY(), { cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 }, { x: 0, y: 0 })
    ).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() =>
      closestPointInto(makeXY(), { cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity }, { x: 0, y: 0 })
    ).toThrow(RangeError);
  });
});

describe('closestPointInto - center non-finite pass-through', () => {
  test('cx Infinity는 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    let result: boolean | undefined;
    expect(() => {
      result = closestPointInto(out, { cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 });
    }).not.toThrow();
    expect(result).toBe(true);
    // Infinity - 2 - NaN 형태로 비유한 산술 → non-finite
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('cy NaN은 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    closestPointInto(out, { cx: 0, cy: NaN, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 });
    expect(Number.isFinite(out.y)).toBe(false);
  });

  test('point.x Infinity는 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    let result: boolean | undefined;
    expect(() => {
      result = closestPointInto(out, flat, { x: Infinity, y: 0 });
    }).not.toThrow();
    expect(result).toBe(true);
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('point.y NaN은 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: 0, y: NaN });
    expect(Number.isFinite(out.y)).toBe(false);
  });

  test('cx -Infinity는 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    let result: boolean | undefined;
    expect(() => {
      result = closestPointInto(out, { cx: -Infinity, cy: 0, width: 4, height: 2, angle: 0 }, { x: 0, y: 0 });
    }).not.toThrow();
    expect(result).toBe(true);
    expect(Number.isFinite(out.x)).toBe(false);
  });

  test('point.x -Infinity는 throw 없이 non-finite 좌표를 기록한다', () => {
    const out = makeXY();
    closestPointInto(out, flat, { x: -Infinity, y: 0 });
    expect(Number.isFinite(out.x)).toBe(false);
  });
});

// ─── closestPoint (companion) ─────────────────────────────────────────

describe('closestPoint', () => {
  test('성공 시 새 { x, y } object를 반환한다', () => {
    const result = closestPoint(flat, { x: 5, y: 0 });
    expect(result).toEqual({ x: 2, y: 0 });
  });

  test('내부점은 같은 좌표를 반환한다', () => {
    expect(closestPoint(flat, { x: 1, y: 0.5 })).toEqual({ x: 1, y: 0.5 });
  });

  test('empty size는 undefined', () => {
    expect(closestPoint({ cx: 0, cy: 0, width: 0, height: 2, angle: 0 }, { x: 5, y: 0 })).toBeUndefined();
  });

  test('invalid size는 RangeError', () => {
    expect(() => closestPoint({ cx: 0, cy: 0, width: 4, height: NaN, angle: 0 }, { x: 0, y: 0 })).toThrow(RangeError);
  });

  test('매 호출마다 새 object를 반환한다', () => {
    const a = closestPoint(flat, { x: 5, y: 0 });
    const b = closestPoint(flat, { x: 5, y: 0 });
    expect(a).not.toBe(b);
  });

  test('return type은 PointWritable | undefined', () => {
    const result = closestPoint(flat, { x: 0, y: 0 });
    expectTypeOf(result).toEqualTypeOf<PointWritable | undefined>();
  });
});
