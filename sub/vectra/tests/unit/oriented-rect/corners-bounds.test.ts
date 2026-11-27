/** 회전 사각형 꼭짓점 순서와 경계 상자 계산을 검증한다. */
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/oriented-rect/bounds';
import { boundsInto } from '../../../src/oriented-rect/bounds-into';
import { corners } from '../../../src/oriented-rect/corners';
import { cornersInto } from '../../../src/oriented-rect/corners-into';
import type { BoundsWritable, OrientedRect } from '../../../src/types/flat-shapes.internal';

/** 비어 있는 경계 상자 출력 객체를 만든다. */
function makeBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}

// center (0,0), size 4×2, angle 0
const flat: OrientedRect = { cx: 0, cy: 0, width: 4, height: 2, angle: 0 };

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
    cornersInto(out, { cx: 3, cy: 5, width: 4, height: 2, angle: 0 });
    expect(out).toEqual([
      { x: 1, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 6 },
      { x: 1, y: 6 },
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
    cornersInto(out, { cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 });
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
  test('width <= 0이어도 raw corner 4개를 유지한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { cx: 0, cy: 0, width: 0, height: 2, angle: 0 });
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
    cornersInto(out, { cx: 0, cy: 0, width: -4, height: 2, angle: 0 });
    expect(out).toHaveLength(4);
  });
});

describe('cornersInto - center pass-through', () => {
  // cornersInto는 항상 새 {x,y}를 push하므로 input과 aliasing되지 않는다.
  // 별도 aliasing 테스트 대신 center non-finite pass-through를 검증한다.
  test('cx Infinity는 throw 없이 corner에 그대로 전파된다', () => {
    const out: { x: number; y: number }[] = [];
    expect(() => cornersInto(out, { cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 })).not.toThrow();
    expect(out[0].x).toBe(Infinity);
  });

  test('cy NaN은 throw 없이 corner에 NaN으로 전파된다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, { cx: 0, cy: NaN, width: 4, height: 2, angle: 0 });
    expect(Number.isNaN(out[0].y)).toBe(true);
  });
});

describe('cornersInto - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => cornersInto([], { cx: 0, cy: 0, width: NaN, height: 2, angle: 0 })).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() => cornersInto([], { cx: 0, cy: 0, width: 4, height: Infinity, angle: 0 })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => cornersInto([], { cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity })).toThrow(RangeError);
  });

  test('angle NaN이면 RangeError', () => {
    expect(() => cornersInto([], { cx: 0, cy: 0, width: 4, height: 2, angle: NaN })).toThrow(RangeError);
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
    expect(() => corners({ cx: 0, cy: 0, width: 4, height: NaN, angle: 0 })).toThrow(RangeError);
  });
});

// ─── boundsInto ───────────────────────────────────────────────────────

describe('boundsInto - angle 0', () => {
  test('center/size AABB를 기록하고 out을 반환한다', () => {
    const out = makeBounds();
    const result = boundsInto(out, { cx: 3, cy: 5, width: 4, height: 2, angle: 0 });
    expect(result).toBe(out);
    expect(out.minX).toBeCloseTo(1, 10);
    expect(out.minY).toBeCloseTo(4, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(6, 10);
  });
});

describe('boundsInto - 회전', () => {
  test('Math.PI / 2 회전 AABB를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 });
    expect(out.minX).toBeCloseTo(-1, 10);
    expect(out.minY).toBeCloseTo(-2, 10);
    expect(out.maxX).toBeCloseTo(1, 10);
    expect(out.maxY).toBeCloseTo(2, 10);
  });

  test('45도 회전 AABB는 대각선 extent를 따른다', () => {
    const out = makeBounds();
    // size 2×2 정사각형을 45도 회전 → 반대각선 half-extent = sqrt(2)
    boundsInto(out, { cx: 0, cy: 0, width: 2, height: 2, angle: Math.PI / 4 });
    expect(out.maxX).toBeCloseTo(Math.SQRT2, 10);
    expect(out.maxY).toBeCloseTo(Math.SQRT2, 10);
    expect(out.minX).toBeCloseTo(-Math.SQRT2, 10);
  });
});

describe('boundsInto - empty size', () => {
  test('width <= 0이면 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { cx: 0, cy: 0, width: 0, height: 2, angle: 0 });
    expect(out.minX).toBe(Infinity);
    expect(out.minY).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
    expect(out.maxY).toBe(-Infinity);
  });

  test('height <= 0이면 sentinel empty bounds를 기록한다', () => {
    const out = makeBounds();
    boundsInto(out, { cx: 1, cy: 1, width: 4, height: -2, angle: 1 });
    expect(out.minX).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
  });
});

describe('boundsInto - aliasing', () => {
  test('입력과 출력이 같은 객체여도 경계를 기록한다', () => {
    const out = { ...makeBounds(), cx: 3, cy: 5, width: 4, height: 2, angle: 0 };
    boundsInto(out, out);
    expect(out.minX).toBeCloseTo(1, 10);
    expect(out.minY).toBeCloseTo(4, 10);
    expect(out.maxX).toBeCloseTo(5, 10);
    expect(out.maxY).toBeCloseTo(6, 10);
  });
});

describe('boundsInto - center pass-through', () => {
  test('cx Infinity는 throw 없이 AABB에 전파된다', () => {
    const out = makeBounds();
    expect(() => boundsInto(out, { cx: Infinity, cy: 0, width: 4, height: 2, angle: 0 })).not.toThrow();
    expect(out.maxX).toBe(Infinity);
  });
});

describe('boundsInto - invalid size/angle', () => {
  test('size NaN이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { cx: 0, cy: 0, width: NaN, height: 2, angle: 0 })).toThrow(RangeError);
  });

  test('angle Infinity이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { cx: 0, cy: 0, width: 4, height: 2, angle: Infinity })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => boundsInto(makeBounds(), { cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity })).toThrow(RangeError);
  });
});

// ─── bounds (companion) ────────────────────────────────────────────────

describe('bounds', () => {
  test('새 plain object로 AABB를 반환한다', () => {
    const result = bounds({ cx: 3, cy: 5, width: 4, height: 2, angle: 0 });
    expect(result.minX).toBeCloseTo(1, 10);
    expect(result.maxY).toBeCloseTo(6, 10);
  });

  test('empty size는 sentinel empty bounds를 반환한다', () => {
    const result = bounds({ cx: 0, cy: 0, width: 0, height: 0, angle: 0 });
    expect(result.minX).toBe(Infinity);
    expect(result.maxX).toBe(-Infinity);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => bounds({ cx: 0, cy: 0, width: 4, height: 2, angle: NaN })).toThrow(RangeError);
  });
});
