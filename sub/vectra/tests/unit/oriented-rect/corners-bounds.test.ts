import { describe, expect, expectTypeOf, test } from 'vitest';
import { bounds } from '../../../src/oriented-rect/bounds';
import { boundsInto } from '../../../src/oriented-rect/bounds-into';
import { corners } from '../../../src/oriented-rect/corners';
import { cornersInto } from '../../../src/oriented-rect/corners-into';
import type { BoundsWritable, OrientedRectLike, OrientedRectWritable, XYTupleWritable } from '../../../src/types';

function makeBounds(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// center (0,0), size 4×2, angle 0
const flat: OrientedRectLike = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 };

// ─── cornersInto ────────────────────────────────────────────────────

describe('cornersInto - angle 0', () => {
  test('local top-left → top-right → bottom-right → bottom-left 순서로 exact 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, flat);
    expect(out).toEqual([
      { x: -2, y: -1 },
      { x: 2, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ]);
  });

  test('center offset을 반영한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { center: { x: 3, y: 5 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(out).toEqual([
      { x: 1, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 6 },
      { x: 1, y: 6 },
    ]);
  });

  test('tuple input에서도 같은 corner를 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, [[0, 0], [4, 2], 0]);
    expect(out).toEqual([
      { x: -2, y: -1 },
      { x: 2, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ]);
  });

  test('호출 전 out 내용을 비우고 항상 4개를 push한다', () => {
    const out: { x: number; y: number }[] = [
      { x: 9, y: 9 },
      { x: 9, y: 9 },
      { x: 9, y: 9 },
    ];
    cornersInto(out, flat);
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({ x: -2, y: -1 });
  });
});

describe('cornersInto - 회전', () => {
  test('Math.PI / 2 회전 corner를 close하게 기록한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 });
    // TL(1,-2) TR(1,2) BR(-1,2) BL(-1,-2)
    expect(out[0].x).toBeCloseTo(1, 10);
    expect(out[0].y).toBeCloseTo(-2, 10);
    expect(out[1].x).toBeCloseTo(1, 10);
    expect(out[1].y).toBeCloseTo(2, 10);
    expect(out[2].x).toBeCloseTo(-1, 10);
    expect(out[2].y).toBeCloseTo(2, 10);
    expect(out[3].x).toBeCloseTo(-1, 10);
    expect(out[3].y).toBeCloseTo(-2, 10);
  });
});

describe('cornersInto - empty size', () => {
  test('size.x <= 0이어도 raw corner 4개를 유지한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { center: { x: 0, y: 0 }, size: { x: 0, y: 2 }, angle: 0 });
    expect(out).toHaveLength(4);
    expect(out).toEqual([
      { x: 0, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 1 },
    ]);
  });

  test('negative size에서도 raw corner 4개를 유지한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { center: { x: 0, y: 0 }, size: { x: -4, y: 2 }, angle: 0 });
    expect(out).toHaveLength(4);
  });
});

describe('cornersInto - center pass-through', () => {
  // cornersInto는 항상 새 {x,y}를 push하므로 input과 aliasing되지 않는다.
  // 별도 aliasing 테스트 대신 center non-finite pass-through를 검증한다.
  test('center.x Infinity는 throw 없이 corner에 그대로 전파된다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cornersInto(out, { center: { x: Infinity, y: 0 }, size: { x: 4, y: 2 }, angle: 0 })).not.toThrow();
    expect(out[0].x).toBe(Infinity);
  });

  test('center.y NaN은 throw 없이 corner에 NaN으로 전파된다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { center: { x: 0, y: NaN }, size: { x: 4, y: 2 }, angle: 0 });
    expect(Number.isNaN(out[0].y)).toBe(true);
  });
});

describe('cornersInto - invalid size/angle', () => {
  test('size.x NaN이면 RangeError', () => {
    expect(() => cornersInto([], { center: { x: 0, y: 0 }, size: { x: NaN, y: 2 }, angle: 0 })).toThrow(RangeError);
  });

  test('size.y Infinity이면 RangeError', () => {
    expect(() => cornersInto([], { center: { x: 0, y: 0 }, size: { x: 4, y: Infinity }, angle: 0 })).toThrow(
      RangeError
    );
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => cornersInto([], { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: -Infinity })).toThrow(
      RangeError
    );
  });

  test('angle NaN이면 RangeError', () => {
    expect(() => cornersInto([], { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: NaN })).toThrow(RangeError);
  });
});

// ─── corners (companion) ──────────────────────────────────────────────

describe('corners', () => {
  test('새 plain object array 4개를 반환한다', () => {
    const result = corners(flat);
    expect(result).toEqual([
      { x: -2, y: -1 },
      { x: 2, y: -1 },
      { x: 2, y: 1 },
      { x: -2, y: 1 },
    ]);
  });

  test('invalid size는 RangeError', () => {
    expect(() => corners({ center: { x: 0, y: 0 }, size: { x: 4, y: NaN }, angle: 0 })).toThrow(RangeError);
  });
});

// ─── boundsInto ───────────────────────────────────────────────────────

describe('boundsInto - angle 0', () => {
  test('center/size AABB를 기록하고 out을 반환한다', () => {
    const out = makeBounds();
    const result = boundsInto(out, { center: { x: 3, y: 5 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(result).toBe(out);
    expect(asXY(out.min).x).toBeCloseTo(1, 10);
    expect(asXY(out.min).y).toBeCloseTo(4, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(6, 10);
  });

  test('tuple input에서도 AABB를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, [[0, 0], [4, 2], 0]);
    expect(asXY(out.min).x).toBeCloseTo(-2, 10);
    expect(asXY(out.max).y).toBeCloseTo(1, 10);
  });
});

describe('boundsInto - 회전', () => {
  test('Math.PI / 2 회전 AABB를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 });
    expect(asXY(out.min).x).toBeCloseTo(-1, 10);
    expect(asXY(out.min).y).toBeCloseTo(-2, 10);
    expect(asXY(out.max).x).toBeCloseTo(1, 10);
    expect(asXY(out.max).y).toBeCloseTo(2, 10);
  });

  test('45도 회전 AABB는 대각선 extent를 따른다', () => {
    const out = makeBounds();
    // size 2×2 정사각형을 45도 회전 → 반대각선 half-extent = sqrt(2)
    boundsInto(out, { center: { x: 0, y: 0 }, size: { x: 2, y: 2 }, angle: Math.PI / 4 });
    expect(asXY(out.max).x).toBeCloseTo(Math.SQRT2, 10);
    expect(asXY(out.max).y).toBeCloseTo(Math.SQRT2, 10);
    expect(asXY(out.min).x).toBeCloseTo(-Math.SQRT2, 10);
  });
});

describe('boundsInto - empty size', () => {
  test('size.x <= 0이면 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { center: { x: 0, y: 0 }, size: { x: 0, y: 2 }, angle: 0 });
    expect(asXY(out.min).x).toBe(Infinity);
    expect(asXY(out.min).y).toBe(Infinity);
    expect(asXY(out.max).x).toBe(-Infinity);
    expect(asXY(out.max).y).toBe(-Infinity);
  });

  test('size.y <= 0이면 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { center: { x: 1, y: 1 }, size: { x: 4, y: -2 }, angle: 1 });
    expect(asXY(out.min).x).toBe(Infinity);
    expect(asXY(out.max).x).toBe(-Infinity);
  });
});

describe('boundsInto - aliasing', () => {
  test('out.min === rect.center aliasing에서도 정의대로 동작한다', () => {
    const center = { x: 3, y: 5 };
    const rect: OrientedRectWritable = { center, size: { x: 4, y: 2 }, angle: 0 };
    const out: BoundsWritable = { min: center, max: { x: 0, y: 0 } };
    boundsInto(out, rect);
    expect(asXY(out.min).x).toBeCloseTo(1, 10);
    expect(asXY(out.min).y).toBeCloseTo(4, 10);
    expect(asXY(out.max).x).toBeCloseTo(5, 10);
    expect(asXY(out.max).y).toBeCloseTo(6, 10);
  });
});

describe('boundsInto - mutable tuple storage', () => {
  test('tuple min/max storage에 기록한다', () => {
    const min: [number, number] = [0, 0];
    const max: [number, number] = [0, 0];
    const out: BoundsWritable<XYTupleWritable, XYTupleWritable> = { min, max };
    boundsInto(out, { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(min).toEqual([-2, -1]);
    expect(max).toEqual([2, 1]);
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
    const result = boundsInto(out, flat);
    expectTypeOf(result).toEqualTypeOf<TaggedBounds>();
  });
});

describe('boundsInto - center pass-through', () => {
  test('center.x Infinity는 throw 없이 AABB에 전파된다', () => {
    const out = makeBounds();
    expect(() => boundsInto(out, { center: { x: Infinity, y: 0 }, size: { x: 4, y: 2 }, angle: 0 })).not.toThrow();
    expect(asXY(out.max).x).toBe(Infinity);
  });
});

describe('boundsInto - invalid size/angle', () => {
  test('size NaN이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { center: { x: 0, y: 0 }, size: { x: NaN, y: 2 }, angle: 0 })).toThrow(
      RangeError
    );
  });

  test('angle Infinity이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Infinity })).toThrow(
      RangeError
    );
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: -Infinity })).toThrow(
      RangeError
    );
  });
});

// ─── bounds (companion) ────────────────────────────────────────────────

describe('bounds', () => {
  test('새 plain object로 AABB를 반환한다', () => {
    const result = bounds({ center: { x: 3, y: 5 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(asXY(result.min).x).toBeCloseTo(1, 10);
    expect(asXY(result.max).y).toBeCloseTo(6, 10);
  });

  test('empty size는 sentinel empty bounds를 반환한다', () => {
    const result = bounds({ center: { x: 0, y: 0 }, size: { x: 0, y: 0 }, angle: 0 });
    expect(asXY(result.min).x).toBe(Infinity);
    expect(asXY(result.max).x).toBe(-Infinity);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => bounds({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: NaN })).toThrow(RangeError);
  });
});
