import { describe, expect, expectTypeOf, test } from 'vitest';
import { axes } from '../../../src/oriented-rect/axes';
import { fromRect } from '../../../src/oriented-rect/from-rect';
import { fromRectInto } from '../../../src/oriented-rect/from-rect-into';
import type { OrientedRectWritable, XYTupleWritable } from '../../../src/types';

function makeOriented(): OrientedRectWritable {
  return { center: { x: 0, y: 0 }, size: { x: 0, y: 0 }, angle: 0 };
}

function asXY(value: unknown): { x: number; y: number } {
  return value as { x: number; y: number };
}

// ─── fromRectInto ──────────────────────────────────────────────────────

describe('fromRectInto - 기본', () => {
  test('rect center/size/angle을 기록하고 out을 반환한다', () => {
    const out = makeOriented();
    const result = fromRectInto(out, { x: 0, y: 0, width: 4, height: 2 }, Math.PI / 3);
    expect(result).toBe(out);
    expect(asXY(out.center).x).toBeCloseTo(2, 10);
    expect(asXY(out.center).y).toBeCloseTo(1, 10);
    expect(asXY(out.size).x).toBeCloseTo(4, 10);
    expect(asXY(out.size).y).toBeCloseTo(2, 10);
    expect(out.angle).toBeCloseTo(Math.PI / 3, 10);
  });

  test('tuple rect input에서도 center를 (x+w/2, y+h/2)로 기록한다', () => {
    const out = makeOriented();
    fromRectInto(out, [10, 20, 4, 6], 0);
    expect(asXY(out.center).x).toBeCloseTo(12, 10);
    expect(asXY(out.center).y).toBeCloseTo(23, 10);
    expect(asXY(out.size).x).toBeCloseTo(4, 10);
    expect(asXY(out.size).y).toBeCloseTo(6, 10);
  });
});

describe('fromRectInto - negative dimension', () => {
  test('negative width/height를 size에 그대로 보존한다', () => {
    const out = makeOriented();
    fromRectInto(out, { x: 0, y: 0, width: -4, height: -2 }, 0);
    expect(asXY(out.size).x).toBeCloseTo(-4, 10);
    expect(asXY(out.size).y).toBeCloseTo(-2, 10);
    // center = (0 + (-4)/2, 0 + (-2)/2)
    expect(asXY(out.center).x).toBeCloseTo(-2, 10);
    expect(asXY(out.center).y).toBeCloseTo(-1, 10);
  });
});

describe('fromRectInto - tuple nested output', () => {
  test('tuple center/size storage에 기록한다', () => {
    const center: [number, number] = [0, 0];
    const size: [number, number] = [0, 0];
    const out: OrientedRectWritable<XYTupleWritable, XYTupleWritable> = { center, size, angle: 0 };
    fromRectInto(out, { x: 0, y: 0, width: 4, height: 2 }, 1);
    expect(center).toEqual([2, 1]);
    expect(size).toEqual([4, 2]);
    expect(out.angle).toBeCloseTo(1, 10);
  });
});

describe('fromRectInto - aliasing', () => {
  test('rect와 out.center가 같은 object여도 정의대로 동작한다', () => {
    const shared = { x: 0, y: 0, width: 4, height: 2 };
    const out: OrientedRectWritable = { center: shared, size: { x: 0, y: 0 }, angle: 0 };
    fromRectInto(out, shared, 0);
    expect(asXY(out.center).x).toBeCloseTo(2, 10);
    expect(asXY(out.center).y).toBeCloseTo(1, 10);
    expect(asXY(out.size).x).toBeCloseTo(4, 10);
    expect(asXY(out.size).y).toBeCloseTo(2, 10);
  });
});

describe('fromRectInto - generic return type', () => {
  test('OrientedRectWritable subtype의 return type을 보존한다', () => {
    interface TaggedOriented extends OrientedRectWritable {
      tag: string;
    }
    const out: TaggedOriented = { center: { x: 0, y: 0 }, size: { x: 0, y: 0 }, angle: 0, tag: 'test' };
    const result = fromRectInto(out, { x: 0, y: 0, width: 4, height: 2 }, 0);
    expectTypeOf(result).toEqualTypeOf<TaggedOriented>();
  });
});

describe('fromRectInto - x/y pass-through', () => {
  test('rect.x Infinity는 throw 없이 center.x에 전파된다', () => {
    const out = makeOriented();
    expect(() => fromRectInto(out, { x: Infinity, y: 0, width: 4, height: 2 }, 0)).not.toThrow();
    expect(asXY(out.center).x).toBe(Infinity);
  });

  test('rect.y NaN은 throw 없이 center.y에 NaN으로 전파된다', () => {
    const out = makeOriented();
    fromRectInto(out, { x: 0, y: NaN, width: 4, height: 2 }, 0);
    expect(Number.isNaN(asXY(out.center).y)).toBe(true);
  });
});

describe('fromRectInto - invalid size/angle', () => {
  test('width NaN이면 RangeError', () => {
    expect(() => fromRectInto(makeOriented(), { x: 0, y: 0, width: NaN, height: 2 }, 0)).toThrow(RangeError);
  });

  test('height Infinity이면 RangeError', () => {
    expect(() => fromRectInto(makeOriented(), { x: 0, y: 0, width: 4, height: Infinity }, 0)).toThrow(RangeError);
  });

  test('width -Infinity이면 RangeError', () => {
    expect(() => fromRectInto(makeOriented(), { x: 0, y: 0, width: -Infinity, height: 2 }, 0)).toThrow(RangeError);
  });

  test('angle NaN이면 RangeError', () => {
    expect(() => fromRectInto(makeOriented(), { x: 0, y: 0, width: 4, height: 2 }, NaN)).toThrow(RangeError);
  });
});

// ─── fromRect (companion) ───────────────────────────────────────────────

describe('fromRect', () => {
  test('새 plain object를 반환한다', () => {
    const result = fromRect({ x: 0, y: 0, width: 4, height: 2 }, 0);
    expect(asXY(result.center).x).toBeCloseTo(2, 10);
    expect(asXY(result.center).y).toBeCloseTo(1, 10);
    expect(asXY(result.size).x).toBeCloseTo(4, 10);
    expect(asXY(result.size).y).toBeCloseTo(2, 10);
    expect(result.angle).toBe(0);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => fromRect({ x: 0, y: 0, width: 4, height: 2 }, Infinity)).toThrow(RangeError);
  });
});

// ─── axes ────────────────────────────────────────────────────────────────

describe('axes', () => {
  test('angle 0이면 xAxis (1,0), yAxis (0,1)', () => {
    const pair = axes({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 });
    expect(pair.xAxis.x).toBeCloseTo(1, 10);
    expect(pair.xAxis.y).toBeCloseTo(0, 10);
    expect(pair.yAxis.x).toBeCloseTo(0, 10);
    expect(pair.yAxis.y).toBeCloseTo(1, 10);
  });

  test('angle PI/2이면 xAxis (0,1), yAxis (-1,0)', () => {
    const pair = axes({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 });
    expect(pair.xAxis.x).toBeCloseTo(0, 10);
    expect(pair.xAxis.y).toBeCloseTo(1, 10);
    expect(pair.yAxis.x).toBeCloseTo(-1, 10);
    expect(pair.yAxis.y).toBeCloseTo(0, 10);
  });

  test('angle PI이면 xAxis (-1,0), yAxis (0,-1)', () => {
    const pair = axes([[0, 0], [4, 2], Math.PI]);
    expect(pair.xAxis.x).toBeCloseTo(-1, 10);
    expect(pair.xAxis.y).toBeCloseTo(0, 10);
    expect(pair.yAxis.x).toBeCloseTo(0, 10);
    expect(pair.yAxis.y).toBeCloseTo(-1, 10);
  });

  test('임의 angle에서 axis는 unit length이고 서로 orthogonal하다', () => {
    const angle = 0.937;
    const pair = axes({ center: { x: 1, y: 2 }, size: { x: 3, y: 5 }, angle });
    const xLen = Math.hypot(pair.xAxis.x, pair.xAxis.y);
    const yLen = Math.hypot(pair.yAxis.x, pair.yAxis.y);
    const dot = pair.xAxis.x * pair.yAxis.x + pair.xAxis.y * pair.yAxis.y;
    expect(xLen).toBeCloseTo(1, 10);
    expect(yLen).toBeCloseTo(1, 10);
    expect(dot).toBeCloseTo(0, 10);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => axes({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: NaN })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => axes({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: -Infinity })).toThrow(RangeError);
  });

  test('invalid size는 RangeError', () => {
    expect(() => axes({ center: { x: 0, y: 0 }, size: { x: Infinity, y: 2 }, angle: 0 })).toThrow(RangeError);
  });
});
