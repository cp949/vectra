/** 회전 사각형 생성과 회전축 계산을 검증한다. */
import { describe, expect, test } from 'vitest';
import { axes } from '../../../src/oriented-rect/axes';
import { fromRect } from '../../../src/oriented-rect/from-rect';
import { fromRectInto } from '../../../src/oriented-rect/from-rect-into';
import type { OrientedRectWritable } from '../../../src/types/flat-shapes.internal';

/** 회전 사각형 출력 객체를 만든다. */
function makeOriented(): OrientedRectWritable {
  return { cx: 0, cy: 0, width: 0, height: 0, angle: 0 };
}

// ─── fromRectInto ──────────────────────────────────────────────────────

describe('fromRectInto - 기본', () => {
  test('rect center/size/angle을 기록하고 out을 반환한다', () => {
    const out = makeOriented();
    const result = fromRectInto(out, { x: 0, y: 0, width: 4, height: 2 }, Math.PI / 3);
    expect(result).toBe(out);
    expect(out.cx).toBeCloseTo(2, 10);
    expect(out.cy).toBeCloseTo(1, 10);
    expect(out.width).toBeCloseTo(4, 10);
    expect(out.height).toBeCloseTo(2, 10);
    expect(out.angle).toBeCloseTo(Math.PI / 3, 10);
  });
});

describe('fromRectInto - negative dimension', () => {
  test('negative width/height를 size에 그대로 보존한다', () => {
    const out = makeOriented();
    fromRectInto(out, { x: 0, y: 0, width: -4, height: -2 }, 0);
    expect(out.width).toBeCloseTo(-4, 10);
    expect(out.height).toBeCloseTo(-2, 10);
    // center = (0 + (-4)/2, 0 + (-2)/2)
    expect(out.cx).toBeCloseTo(-2, 10);
    expect(out.cy).toBeCloseTo(-1, 10);
  });
});

describe('fromRectInto - aliasing', () => {
  test('입력과 출력이 같은 객체여도 중심과 치수를 기록한다', () => {
    const out = { ...makeOriented(), x: 0, y: 0, width: 4, height: 2 };
    fromRectInto(out, out, 0);
    expect(out.cx).toBeCloseTo(2, 10);
    expect(out.cy).toBeCloseTo(1, 10);
    expect(out.width).toBeCloseTo(4, 10);
    expect(out.height).toBeCloseTo(2, 10);
  });
});

describe('fromRectInto - x/y pass-through', () => {
  test('rect.x Infinity는 throw 없이 cx에 전파된다', () => {
    const out = makeOriented();
    expect(() => fromRectInto(out, { x: Infinity, y: 0, width: 4, height: 2 }, 0)).not.toThrow();
    expect(out.cx).toBe(Infinity);
  });

  test('rect.y NaN은 throw 없이 cy에 NaN으로 전파된다', () => {
    const out = makeOriented();
    fromRectInto(out, { x: 0, y: NaN, width: 4, height: 2 }, 0);
    expect(Number.isNaN(out.cy)).toBe(true);
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
    expect(result.cx).toBeCloseTo(2, 10);
    expect(result.cy).toBeCloseTo(1, 10);
    expect(result.width).toBeCloseTo(4, 10);
    expect(result.height).toBeCloseTo(2, 10);
    expect(result.angle).toBe(0);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => fromRect({ x: 0, y: 0, width: 4, height: 2 }, Infinity)).toThrow(RangeError);
  });
});

// ─── axes ────────────────────────────────────────────────────────────────

describe('axes', () => {
  test('angle 0이면 xAxis (1,0), yAxis (0,1)', () => {
    const pair = axes({ cx: 0, cy: 0, width: 4, height: 2, angle: 0 });
    expect(pair.xAxis.x).toBeCloseTo(1, 10);
    expect(pair.xAxis.y).toBeCloseTo(0, 10);
    expect(pair.yAxis.x).toBeCloseTo(0, 10);
    expect(pair.yAxis.y).toBeCloseTo(1, 10);
  });

  test('angle PI/2이면 xAxis (0,1), yAxis (-1,0)', () => {
    const pair = axes({ cx: 0, cy: 0, width: 4, height: 2, angle: Math.PI / 2 });
    expect(pair.xAxis.x).toBeCloseTo(0, 10);
    expect(pair.xAxis.y).toBeCloseTo(1, 10);
    expect(pair.yAxis.x).toBeCloseTo(-1, 10);
    expect(pair.yAxis.y).toBeCloseTo(0, 10);
  });

  test('angle PI이면 xAxis (-1,0), yAxis (0,-1)', () => {
    const pair = axes({ ...makeOriented(), width: 4, height: 2, angle: Math.PI });
    expect(pair.xAxis.x).toBeCloseTo(-1, 10);
    expect(pair.xAxis.y).toBeCloseTo(0, 10);
    expect(pair.yAxis.x).toBeCloseTo(0, 10);
    expect(pair.yAxis.y).toBeCloseTo(-1, 10);
  });

  test('임의 angle에서 axis는 unit length이고 서로 orthogonal하다', () => {
    const angle = 0.937;
    const pair = axes({ cx: 1, cy: 2, width: 3, height: 5, angle });
    const xLen = Math.hypot(pair.xAxis.x, pair.xAxis.y);
    const yLen = Math.hypot(pair.yAxis.x, pair.yAxis.y);
    const dot = pair.xAxis.x * pair.yAxis.x + pair.xAxis.y * pair.yAxis.y;
    expect(xLen).toBeCloseTo(1, 10);
    expect(yLen).toBeCloseTo(1, 10);
    expect(dot).toBeCloseTo(0, 10);
  });

  test('invalid angle은 RangeError', () => {
    expect(() => axes({ cx: 0, cy: 0, width: 4, height: 2, angle: NaN })).toThrow(RangeError);
  });

  test('angle -Infinity이면 RangeError', () => {
    expect(() => axes({ cx: 0, cy: 0, width: 4, height: 2, angle: -Infinity })).toThrow(RangeError);
  });

  test('invalid size는 RangeError', () => {
    expect(() => axes({ cx: 0, cy: 0, width: Infinity, height: 2, angle: 0 })).toThrow(RangeError);
  });
});
