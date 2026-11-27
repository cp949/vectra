/** 최근접점과 거리, 방향별 확장, 경계 상자 생성 정책을 시험한다. */

import { describe, expect, test } from 'vitest';
import { closestPoint } from '../../../src/bounds/closest-point';
import { closestPointInto } from '../../../src/bounds/closest-point-into';
import { distanceToPoint } from '../../../src/bounds/distance-to-point';
import { expandBySides } from '../../../src/bounds/expand-by-sides';
import { expandBySidesInto } from '../../../src/bounds/expand-by-sides-into';
import { fromCenter } from '../../../src/bounds/from-center';
import { fromCenterInto } from '../../../src/bounds/from-center-into';
import { fromPoints } from '../../../src/bounds/from-points';
import { fromRect } from '../../../src/bounds/from-rect';
import type { BoundsWritable, PointWritable } from '../../../src/types/flat-shapes.internal';

/** 지정한 네 좌표로 경계 상자를 만든다. */
function makeBounds(minX = 0, minY = 0, maxX = 0, maxY = 0): BoundsWritable {
  return { minX, minY, maxX, maxY };
}

/** 지정한 좌표로 점을 만든다. */
function makePoint(x = 0, y = 0): PointWritable {
  return { x, y };
}

// ─── closestPointInto ────────────────────────────────────────────────────────

describe('closestPointInto', () => {
  test('내부 point는 input 좌표를 그대로 기록하고 true를 반환한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(0, 0, 10, 10), { x: 5, y: 5 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('경계(boundary) point는 input 좌표를 그대로 기록한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: 0, y: 5 });
    expect(out).toEqual({ x: 0, y: 5 });
  });

  test('left 방향 외부 point는 minX로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: -3, y: 5 });
    expect(out).toEqual({ x: 2, y: 5 });
  });

  test('right 방향 외부 point는 maxX로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 15, y: 5 });
    expect(out).toEqual({ x: 8, y: 5 });
  });

  test('top 방향 외부 point는 minY로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 5, y: -1 });
    expect(out).toEqual({ x: 5, y: 2 });
  });

  test('bottom 방향 외부 point는 maxY로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: 5, y: 20 });
    expect(out).toEqual({ x: 5, y: 8 });
  });

  test('대각선 외부 point는 corner로 clamp한다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(2, 2, 8, 8), { x: -1, y: -1 });
    expect(out).toEqual({ x: 2, y: 2 });
  });

  test('line bounds(zero-height)를 non-empty로 처리한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(0, 5, 10, 5), { x: 3, y: 0 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 5 });
  });

  test('point bounds(min === max)를 non-empty로 처리한다', () => {
    const out = makePoint();
    const result = closestPointInto(out, makeBounds(5, 5, 5, 5), { x: 3, y: 3 });
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('empty(inverted) bounds에서 false를 반환하고 out을 수정하지 않는다', () => {
    const out = makePoint(99, 99);
    const result = closestPointInto(out, makeBounds(10, 0, 5, 10), { x: 5, y: 5 });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('sentinel bounds에서 false를 반환한다', () => {
    const out = makePoint(99, 99);
    const result = closestPointInto(
      out,
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      { x: 0, y: 0 }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('out이 point와 alias되어도 안전하다', () => {
    const pt: PointWritable = { x: 15, y: 5 };
    closestPointInto(pt, makeBounds(0, 0, 10, 10), pt);
    expect(pt).toEqual({ x: 10, y: 5 });
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: NaN, y: 5 });
    expect(Number.isNaN(out.x)).toBe(true);
    expect(out.y).toBe(5);
  });

  test('Infinity 입력은 max로 clamp된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: Infinity, y: 5 });
    expect(out).toEqual({ x: 10, y: 5 });
  });

  test('-Infinity 입력은 min으로 clamp된다', () => {
    const out = makePoint();
    closestPointInto(out, makeBounds(0, 0, 10, 10), { x: -Infinity, y: 5 });
    expect(out).toEqual({ x: 0, y: 5 });
  });
});

// ─── closestPoint ─────────────────────────────────────────────────────────────

describe('closestPoint', () => {
  test('내부 point는 input 좌표를 그대로 반환한다', () => {
    expect(closestPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
  });

  test('외부 point는 AABB boundary로 clamp한 좌표를 반환한다', () => {
    expect(closestPoint(makeBounds(0, 0, 10, 10), { x: 15, y: 5 })).toEqual({ x: 10, y: 5 });
  });

  test('empty bounds에서 undefined를 반환한다', () => {
    expect(closestPoint(makeBounds(10, 0, 5, 10), { x: 0, y: 0 })).toBeUndefined();
  });

  test('sentinel bounds에서 undefined를 반환한다', () => {
    expect(
      closestPoint({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }, { x: 0, y: 0 })
    ).toBeUndefined();
  });

  test('새 plain { x, y } object를 반환한다', () => {
    const result = closestPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 });
    expect(result).not.toBeNull();
    expect(typeof result?.x).toBe('number');
    expect(typeof result?.y).toBe('number');
  });

  test('line bounds를 non-empty로 처리한다', () => {
    expect(closestPoint(makeBounds(0, 5, 10, 5), { x: 3, y: 0 })).toEqual({ x: 3, y: 5 });
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const result = closestPoint(makeBounds(0, 0, 10, 10), { x: NaN, y: 5 });
    expect(result).not.toBeUndefined();
    expect(Number.isNaN(result?.x)).toBe(true);
  });
});

// ─── distanceToPoint ──────────────────────────────────────────────────────────

describe('distanceToPoint', () => {
  test('내부 point는 0을 반환한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 5 })).toBe(0);
  });

  test('boundary point는 0을 반환한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 0, y: 5 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 10, y: 5 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 0 })).toBe(0);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 10 })).toBe(0);
  });

  test('수평 방향 외부 point의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 15, y: 5 })).toBe(5);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -3, y: 5 })).toBe(3);
  });

  test('수직 방향 외부 point의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: 14 })).toBe(4);
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: 5, y: -2 })).toBe(2);
  });

  test('대각선 방향 외부 point의 거리를 계산한다', () => {
    // corner (0,0)에서 (-3, -4)까지 거리 = 5
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -3, y: -4 })).toBeCloseTo(5);
  });

  test('line bounds(zero-height)의 거리를 계산한다', () => {
    expect(distanceToPoint(makeBounds(0, 5, 10, 5), { x: 3, y: 0 })).toBe(5);
  });

  test('point bounds의 거리를 계산한다', () => {
    // point bounds (5,5)에서 (5,8) 거리 = 3
    expect(distanceToPoint(makeBounds(5, 5, 5, 5), { x: 5, y: 8 })).toBeCloseTo(3);
  });

  test('empty(inverted) bounds에서 Infinity를 반환한다', () => {
    expect(distanceToPoint(makeBounds(10, 0, 5, 10), { x: 5, y: 5 })).toBe(Infinity);
  });

  test('sentinel bounds에서 Infinity를 반환한다', () => {
    expect(distanceToPoint({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }, { x: 0, y: 0 })).toBe(
      Infinity
    );
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    expect(Number.isNaN(distanceToPoint(makeBounds(0, 0, 10, 10), { x: NaN, y: 5 }))).toBe(true);
  });

  test('Infinity 입력은 JS 산술 결과(Infinity)를 반환한다', () => {
    // cx = Math.min(Math.max(Infinity, 0), 10) = 10, 하지만 Infinity - 10 = Infinity
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: Infinity, y: 5 })).toBe(Infinity);
  });

  test('-Infinity 입력은 JS 산술 결과(Infinity)를 반환한다', () => {
    // cx = Math.min(Math.max(-Infinity, 0), 10) = 0, 하지만 -Infinity - 0 = -Infinity
    expect(distanceToPoint(makeBounds(0, 0, 10, 10), { x: -Infinity, y: 5 })).toBe(Infinity);
  });
});

// ─── expandBySidesInto ────────────────────────────────────────────────────────

describe('expandBySidesInto', () => {
  test('모든 방향을 개별 양만큼 확장한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 1, right: 2, bottom: 3, left: 4 });
    expect(out).toEqual({ minX: -2, minY: 1, maxX: 10, maxY: 11 });
  });

  test('0인 방향은 해당 경계를 그대로 둔다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 5, right: 0, bottom: 0, left: 0 });
    expect(out).toEqual({ minX: 2, minY: -3, maxX: 8, maxY: 8 });
  });

  test('음수 padding은 deflate이며 inverted 결과를 허용한다', () => {
    const out = makeBounds();
    expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: -10, right: 0, bottom: -10, left: 0 });
    // minY = 2 - (-10) = 12, maxY = 8 + (-10) = -2 → inverted
    expect(out.minY).toBe(12);
    expect(out.maxY).toBe(-2);
  });

  test('out === bounds여도 안전하다', () => {
    const out = makeBounds(2, 2, 8, 8);
    expandBySidesInto(out, out, { top: 1, right: 2, bottom: 3, left: 4 });
    expect(out).toEqual({ minX: -2, minY: 1, maxX: 10, maxY: 11 });
  });

  test('sentinel bounds에도 raw 산식을 적용한다', () => {
    const out = makeBounds();
    expandBySidesInto(
      out,
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
      { top: 5, right: 0, bottom: 5, left: 0 }
    );
    expect(out.minX).toBe(Infinity);
    expect(out.maxX).toBe(-Infinity);
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = expandBySidesInto(out, makeBounds(2, 2, 8, 8), { top: 1, right: 0, bottom: 0, left: 0 });
    expect(result).toBe(out);
  });
});

// ─── expandBySides ────────────────────────────────────────────────────────────

describe('expandBySides', () => {
  test('새 plain bounds object를 반환한다', () => {
    const result = expandBySides(makeBounds(2, 2, 8, 8), { top: 1, right: 2, bottom: 3, left: 4 });
    expect(result).toEqual({ minX: -2, minY: 1, maxX: 10, maxY: 11 });
  });

  test('음수 padding은 deflate이다', () => {
    const result = expandBySides(makeBounds(2, 2, 8, 8), { top: 0, right: 0, bottom: 0, left: -5 });
    expect(result.minX).toBe(7);
  });
});

// ─── fromRect ─────────────────────────────────────────────────────────────────

describe('fromRect', () => {
  test('rect extent를 bounds로 변환한다', () => {
    const result = fromRect({ x: 2, y: 3, width: 6, height: 4 });
    expect(result).toEqual({ minX: 2, minY: 3, maxX: 8, maxY: 7 });
  });

  test('fromRectInto와 동일한 결과를 반환한다', () => {
    const r = { x: -1, y: 2, width: 5, height: 3 };
    const result = fromRect(r);
    expect(result).toEqual({ minX: -1, minY: 2, maxX: 4, maxY: 5 });
  });

  test('line rect(zero-height)는 line bounds가 된다', () => {
    const result = fromRect({ x: 0, y: 5, width: 10, height: 0 });
    expect(result).toEqual({ minX: 0, minY: 5, maxX: 10, maxY: 5 });
  });

  test('point rect(zero-width, zero-height)는 point bounds가 된다', () => {
    const result = fromRect({ x: 3, y: 4, width: 0, height: 0 });
    expect(result).toEqual({ minX: 3, minY: 4, maxX: 3, maxY: 4 });
  });

  test('negative dimension rect는 inverted bounds가 된다', () => {
    const result = fromRect({ x: 5, y: 5, width: -3, height: 2 });
    expect(result.minX).toBe(5);
    expect(result.maxX).toBe(2);
  });
});

// ─── fromPoints ───────────────────────────────────────────────────────────────

describe('fromPoints', () => {
  test('fromPointsInto와 동일한 결과를 반환한다', () => {
    const result = fromPoints([
      { x: 1, y: 2 },
      { x: 5, y: 0 },
      { x: 3, y: 7 },
    ]);
    expect(result).toEqual({ minX: 1, minY: 0, maxX: 5, maxY: 7 });
  });

  test('빈 배열은 sentinel bounds를 반환한다', () => {
    const result = fromPoints([]);
    expect(result.minX).toBe(Infinity);
    expect(result.minY).toBe(Infinity);
    expect(result.maxX).toBe(-Infinity);
    expect(result.maxY).toBe(-Infinity);
  });

  test('단일 point는 point bounds를 반환한다', () => {
    const result = fromPoints([{ x: 3, y: 4 }]);
    expect(result).toEqual({ minX: 3, minY: 4, maxX: 3, maxY: 4 });
  });
});

// ─── fromCenterInto ───────────────────────────────────────────────────────────

describe('fromCenterInto', () => {
  test('center와 positive size로 bounds를 기록한다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: 6, y: 4 });
    expect(out).toEqual({ minX: 2, minY: 3, maxX: 8, maxY: 7 });
  });

  test('zero size는 point bounds가 된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: 0, y: 0 });
    expect(out).toEqual({ minX: 5, minY: 5, maxX: 5, maxY: 5 });
  });

  test('negative size는 inverted bounds가 된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 5, y: 5 }, { x: -4, y: 2 });
    // hw = -2, hh = 1
    // min = (5 - (-2), 5 - 1) = (7, 4), max = (5 + (-2), 5 + 1) = (3, 6)
    expect(out).toEqual({ minX: 7, minY: 4, maxX: 3, maxY: 6 });
  });

  test('반환값이 out의 동일 참조이다', () => {
    const out = makeBounds();
    const result = fromCenterInto(out, { x: 5, y: 5 }, { x: 4, y: 4 });
    expect(result).toBe(out);
  });

  test('out이 center와 alias되어도 안전하다', () => {
    const out = { ...makeBounds(), x: 5, y: 5 };
    fromCenterInto(out, out, { x: 6, y: 4 });
    expect(out).toMatchObject({ minX: 2, minY: 3, maxX: 8, maxY: 7 });
  });

  test('NaN 입력은 NaN으로 전파된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: NaN, y: 5 }, { x: 4, y: 4 });
    expect(Number.isNaN(out.minX)).toBe(true);
    expect(Number.isNaN(out.maxX)).toBe(true);
  });

  test('Infinity size는 검증 없이 그대로 전파된다', () => {
    const out = makeBounds();
    fromCenterInto(out, { x: 0, y: 0 }, { x: Infinity, y: 4 });
    expect(out.minX).toBe(-Infinity);
    expect(out.maxX).toBe(Infinity);
  });
});

// ─── fromCenter ───────────────────────────────────────────────────────────────

describe('fromCenter', () => {
  test('center와 positive size로 새 plain bounds를 반환한다', () => {
    const result = fromCenter({ x: 5, y: 5 }, { x: 6, y: 4 });
    expect(result).toEqual({ minX: 2, minY: 3, maxX: 8, maxY: 7 });
  });

  test('zero size는 point bounds를 반환한다', () => {
    const result = fromCenter({ x: 3, y: 4 }, { x: 0, y: 0 });
    expect(result).toEqual({ minX: 3, minY: 4, maxX: 3, maxY: 4 });
  });

  test('negative size는 inverted bounds를 반환한다', () => {
    const result = fromCenter({ x: 5, y: 5 }, { x: -4, y: 2 });
    expect(result.minX).toBeGreaterThan(result.maxX);
  });
});
