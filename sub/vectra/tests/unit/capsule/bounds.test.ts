/** 캡슐 경계 상자와 반지름 검증을 시험한다. */
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/capsule/bounds';
import { boundsInto } from '../../../src/capsule/bounds-into';
import type { BoundsWritable } from '../../../src/types/flat-shapes.internal';

/** 비어 있는 경계 상자 출력 객체를 만든다. */
function makeBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

// ─── boundsInto ───────────────────────────────────────────────────────────────

describe('boundsInto - 일반 capsule', () => {
  test('non-axis-aligned capsule의 AABB를 기록한다', () => {
    const out = makeBounds();
    // a=(0,0), b=(4,2), r=1 → min (-1,-1), max (5,3)
    const result = boundsInto(out, { x1: 0, y1: 0, x2: 4, y2: 2, r: 1 });
    expect(result).toBe(out);
    expect(out.minX).toBeCloseTo(-1, 10);
    expect(out.minY).toBeCloseTo(-1, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(3, 10);
  });

  test('endpoint 순서가 반대여도 min/max로 정규화한다', () => {
    const out = makeBounds();
    // a=(4,2), b=(0,0), r=1 → 같은 AABB
    boundsInto(out, { x1: 4, y1: 2, x2: 0, y2: 0, r: 1 });
    expect(out.minX).toBeCloseTo(-1, 10);
    expect(out.minY).toBeCloseTo(-1, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(3, 10);
  });
});

describe('boundsInto - zero-axis capsule', () => {
  test('a === b이면 circle region과 같은 AABB를 기록한다', () => {
    const out = makeBounds();
    // a=b=(2,3), r=5 → min (-3,-2), max (7,8)
    boundsInto(out, { x1: 2, y1: 3, x2: 2, y2: 3, r: 5 });
    expect(out.minX).toBeCloseTo(-3, 10);
    expect(out.minY).toBeCloseTo(-2, 10);
    expect(out.maxX).toBeCloseTo(7, 10);
    expect(out.maxY).toBeCloseTo(8, 10);
  });
});

describe('boundsInto - radius 0', () => {
  test('radius 0이면 segment AABB를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { x1: 0, y1: 0, x2: 4, y2: 2, r: 0 });
    expect(out.minX).toBeCloseTo(0, 10);
    expect(out.minY).toBeCloseTo(0, 10);
    expect(out.maxX).toBeCloseTo(4, 10);
    expect(out.maxY).toBeCloseTo(2, 10);
  });
});

describe('boundsInto - aliasing', () => {
  test('입력과 출력이 같은 객체여도 경계를 기록한다', () => {
    const out = { ...makeBounds(), x1: 0, y1: 0, x2: 4, y2: 2, r: 1 };
    boundsInto(out, out);
    expect(out.minX).toBeCloseTo(-1, 10);
    expect(out.minY).toBeCloseTo(-1, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(3, 10);
  });
});

describe('boundsInto - invalid radius', () => {
  test('radius < 0이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { x1: 0, y1: 0, x2: 4, y2: 2, r: -1 })).toThrow(RangeError);
  });

  test('radius NaN이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { x1: 0, y1: 0, x2: 4, y2: 2, r: NaN })).toThrow(RangeError);
  });

  test('radius Infinity이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { x1: 0, y1: 0, x2: 4, y2: 2, r: Infinity })).toThrow(RangeError);
  });

  test('radius -Infinity이면 RangeError를 던진다', () => {
    expect(() => boundsInto(makeBounds(), { x1: 0, y1: 0, x2: 4, y2: 2, r: -Infinity })).toThrow(RangeError);
  });
});

// ─── bounds (companion) ─────────────────────────────────────────────────────────

describe('bounds', () => {
  test('새 plain object로 AABB를 반환한다', () => {
    const result = bounds({ x1: 0, y1: 0, x2: 4, y2: 2, r: 1 });
    expect(result.minX).toBeCloseTo(-1, 10);
    expect(result.minY).toBeCloseTo(-1, 10);
    expect(result.maxX).toBeCloseTo(5, 10);
    expect(result.maxY).toBeCloseTo(3, 10);
  });

  test('zero-axis capsule의 AABB를 반환한다', () => {
    const result = bounds({ x1: 2, y1: 3, x2: 2, y2: 3, r: 5 });
    expect(result.minX).toBeCloseTo(-3, 10);
    expect(result.maxY).toBeCloseTo(8, 10);
  });

  test('invalid radius는 RangeError를 던진다', () => {
    expect(() => bounds({ x1: 0, y1: 0, x2: 1, y2: 1, r: -1 })).toThrow(RangeError);
  });
});
