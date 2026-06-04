import { describe, expect, expectTypeOf, test } from 'vitest';
import { closestPoint } from '../../../src/capsule/closest-point';
import { closestPointInto } from '../../../src/capsule/closest-point-into';
import type { CapsuleLike, XYWritable } from '../../../src/types';

// a=(0,0), b=(10,0), r=2 인 수평 capsule
const horizontal: CapsuleLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, radius: 2 };
// zero-axis capsule = center (0,0), radius 5 circle
const zeroAxis: CapsuleLike = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 5 };

function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── closestPointInto - 내부/boundary ────────────────────────────────────────────

describe('closestPointInto - 내부 point', () => {
  test('side 내부 point는 같은 좌표를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const result = closestPointInto(out, horizontal, { x: 5, y: 1 });
    expect(result).toBe(out);
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(1, 10);
  });

  test('axis 위 point는 같은 좌표를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, horizontal, { x: 5, y: 0 });
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('boundary point는 같은 좌표를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, horizontal, { x: 5, y: 2 });
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(2, 10);
  });
});

describe('closestPointInto - 외부 point', () => {
  test('side 외부 point는 side boundary point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // q=(5,0), dist 5, push radius 2 → (5,2)
    closestPointInto(out, horizontal, { x: 5, y: 5 });
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(2, 10);
  });

  test('endpoint cap 외부 point는 cap boundary point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // q=(0,0), dir (-1,0), push 2 → (-2,0)
    closestPointInto(out, horizontal, { x: -3, y: 0 });
    expect(asXY(out).x).toBeCloseTo(-2, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('대각선 cap 외부 point의 cap boundary point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // q=(0,0), dx=-3 dy=4 dist=5, push 2 → (-1.2, 1.6)
    closestPointInto(out, horizontal, { x: -3, y: 4 });
    expect(asXY(out).x).toBeCloseTo(-1.2, 10);
    expect(asXY(out).y).toBeCloseTo(1.6, 10);
  });
});

describe('closestPointInto - zero-axis', () => {
  test('center point는 center 좌표를 기록한다(내부)', () => {
    const out: XYWritable = { x: 99, y: 99 };
    closestPointInto(out, zeroAxis, { x: 0, y: 0 });
    expect(asXY(out).x).toBeCloseTo(0, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('내부 point는 같은 좌표를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, zeroAxis, { x: 3, y: 0 });
    expect(asXY(out).x).toBeCloseTo(3, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('boundary point는 같은 좌표를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, zeroAxis, { x: 5, y: 0 });
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('외부 point는 circle boundary point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // dist 8, push 5 → (5,0)
    closestPointInto(out, zeroAxis, { x: 8, y: 0 });
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(0, 10);
  });

  test('finite axis distance 제곱이 overflow해도 boundary point를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    closestPointInto(out, { a: { x: 0, y: 0 }, b: { x: 0, y: 0 }, radius: 1 }, { x: Number.MAX_VALUE / 2, y: 0 });
    expect(asXY(out).x).toBe(1);
    expect(asXY(out).y).toBe(0);
  });
});

describe('closestPointInto - input 형태/aliasing', () => {
  test('tuple input에서도 동작한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const capsule = [[0, 0], [10, 0], 2] as const;
    closestPointInto(out, capsule, [5, 5]);
    expect(asXY(out).x).toBeCloseTo(5, 10);
    expect(asXY(out).y).toBeCloseTo(2, 10);
  });

  test('out === point aliasing에서도 정의대로 동작한다', () => {
    const point: XYWritable = { x: 5, y: 5 };
    const result = closestPointInto(point, horizontal, point);
    expect(result).toBe(point);
    expect(asXY(point).x).toBeCloseTo(5, 10);
    expect(asXY(point).y).toBeCloseTo(2, 10);
  });

  test('mutable tuple out에 기록하고 tuple reference를 반환한다', () => {
    const out: [number, number] = [0, 0];
    const result = closestPointInto(out, horizontal, { x: 5, y: 5 });
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(5, 10);
    expect(out[1]).toBeCloseTo(2, 10);
    expectTypeOf(result).toEqualTypeOf<[number, number]>();
  });
});

describe('closestPointInto - invalid radius', () => {
  test.each([-1, NaN, Infinity, -Infinity])('radius %s는 RangeError', (radius) => {
    const out: XYWritable = { x: 0, y: 0 };
    expect(() => closestPointInto(out, { a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, radius }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });
});

// ─── closestPoint (companion) ─────────────────────────────────────────────────────

describe('closestPoint', () => {
  test('외부 point의 boundary point를 새 object로 반환한다', () => {
    const result = closestPoint(horizontal, { x: 5, y: 5 });
    expect(asXY(result).x).toBeCloseTo(5, 10);
    expect(asXY(result).y).toBeCloseTo(2, 10);
  });

  test('내부 point는 같은 좌표를 반환한다', () => {
    const result = closestPoint(horizontal, { x: 5, y: 1 });
    expect(asXY(result).x).toBeCloseTo(5, 10);
    expect(asXY(result).y).toBeCloseTo(1, 10);
  });

  test('invalid radius는 RangeError를 던진다', () => {
    expect(() => closestPoint({ a: { x: 0, y: 0 }, b: { x: 1, y: 0 }, radius: -1 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });
});
