import { describe, expect, expectTypeOf, test } from 'vitest';
import { bounds } from '../../../src/capsule/bounds';
import { boundsInto } from '../../../src/capsule/bounds-into';
import type { BoundsWritable, CapsuleWritable, XYTupleWritable } from '../../../src/types';

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── boundsInto ───────────────────────────────────────────────────────────────

describe('boundsInto - 일반 capsule', () => {
  test('non-axis-aligned capsule의 AABB를 기록한다', () => {
    const out = makeBounds();
    // a=(0,0), b=(4,2), r=1 → min (-1,-1), max (5,3)
    const result = boundsInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: 1 });
    expect(result).toBe(out);
    expect(asXY(out.min).x).toBeCloseTo(-1, 10);
    expect(asXY(out.min).y).toBeCloseTo(-1, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(3, 10);
  });

  test('tuple input에서도 AABB를 기록한다', () => {
    const out = makeBounds();
    const capsule = [[0, 0], [4, 2], 1] as const;
    boundsInto(out, capsule);
    expect(asXY(out.min).x).toBeCloseTo(-1, 10);
    expect(asXY(out.min).y).toBeCloseTo(-1, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(3, 10);
  });

  test('endpoint 순서가 반대여도 min/max로 정규화한다', () => {
    const out = makeBounds();
    // a=(4,2), b=(0,0), r=1 → 같은 AABB
    boundsInto(out, { a: { x: 4, y: 2 }, b: { x: 0, y: 0 }, radius: 1 });
    expect(asXY(out.min).x).toBeCloseTo(-1, 10);
    expect(asXY(out.min).y).toBeCloseTo(-1, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(3, 10);
  });
});

describe('boundsInto - zero-axis capsule', () => {
  test('a === b이면 circle region과 같은 AABB를 기록한다', () => {
    const out = makeBounds();
    // a=b=(2,3), r=5 → min (-3,-2), max (7,8)
    boundsInto(out, { a: { x: 2, y: 3 }, b: { x: 2, y: 3 }, radius: 5 });
    expect(asXY(out.min).x).toBeCloseTo(-3, 10);
    expect(asXY(out.min).y).toBeCloseTo(-2, 10);
    expect(asXY(out.max).x).toBeCloseTo(7, 10);
    expect(asXY(out.max).y).toBeCloseTo(8, 10);
  });
});

describe('boundsInto - radius 0', () => {
  test('radius 0이면 segment AABB를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: 0 });
    expect(asXY(out.min).x).toBeCloseTo(0, 10);
    expect(asXY(out.min).y).toBeCloseTo(0, 10);
    expect(asXY(out.max).x).toBeCloseTo(4, 10);
    expect(asXY(out.max).y).toBeCloseTo(2, 10);
  });
});

describe('boundsInto - aliasing', () => {
  test('out.min === capsule.a aliasing에서도 정의대로 동작한다', () => {
    const a = { x: 0, y: 0 };
    const capsule: CapsuleWritable = { a, b: { x: 4, y: 2 }, radius: 1 };
    const out: BoundsWritable = { min: a, max: { x: 0, y: 0 } };
    boundsInto(out, capsule);
    expect(asXY(out.min).x).toBeCloseTo(-1, 10);
    expect(asXY(out.min).y).toBeCloseTo(-1, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(3, 10);
  });
});

describe('boundsInto - mutable tuple storage', () => {
  test('tuple min/max storage에 기록한다', () => {
    const min: [number, number] = [0, 0];
    const max: [number, number] = [0, 0];
    const out: BoundsWritable<XYTupleWritable, XYTupleWritable> = { min, max };
    boundsInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: 1 });
    expect(min).toEqual([-1, -1]);
    expect(max).toEqual([5, 3]);
  });
});

describe('boundsInto - generic return type', () => {
  test('BoundsWritable subtype의 return type을 보존한다', () => {
    interface TaggedBounds {
      min: { x: number; y: number };
      max: { x: number; y: number };
      tag: string;
    }
    const out: TaggedBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, tag: 'test' };
    const result = boundsInto(out, { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: 1 });
    expectTypeOf(result).toEqualTypeOf<TaggedBounds>();
  });
});

describe('boundsInto - invalid radius', () => {
  test('radius < 0이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: -1 })).toThrow(RangeError);
  });

  test('radius NaN이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: NaN })).toThrow(RangeError);
  });

  test('radius Infinity이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: Infinity })).toThrow(
      RangeError
    );
  });

  test('radius -Infinity이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: -Infinity })).toThrow(
      RangeError
    );
  });
});

// ─── bounds (companion) ─────────────────────────────────────────────────────────

describe('bounds', () => {
  test('새 plain object로 AABB를 반환한다', () => {
    const result = bounds({ a: { x: 0, y: 0 }, b: { x: 4, y: 2 }, radius: 1 });
    expect(asXY(result.min).x).toBeCloseTo(-1, 10);
    expect(asXY(result.min).y).toBeCloseTo(-1, 10);
    expect(asXY(result.max).x).toBeCloseTo(5, 10);
    expect(asXY(result.max).y).toBeCloseTo(3, 10);
  });

  test('zero-axis capsule의 AABB를 반환한다', () => {
    const result = bounds([[2, 3], [2, 3], 5] as const);
    expect(asXY(result.min).x).toBeCloseTo(-3, 10);
    expect(asXY(result.max).y).toBeCloseTo(8, 10);
  });

  test('invalid radius는 RangeError를 던진다', () => {
    expect(() => bounds({ a: { x: 0, y: 0 }, b: { x: 1, y: 1 }, radius: -1 })).toThrow(RangeError);
  });
});
