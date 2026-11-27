/**
 * infinite-line coordinate/equation builder unit test.
 *
 * fromAngle*, fromSlope*, fromPoints*, fromNormal*, fromCoefficients* 쌍의 success,
 * degenerate fallback, non-finite pass-through, vertical slope,
 * invalid coefficient fallback을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { createInfiniteLine } from '../../../src/infinite-line/create-infinite-line';
import { fromAngle } from '../../../src/infinite-line/from-angle';
import { fromAngleInto } from '../../../src/infinite-line/from-angle-into';
import { fromCoefficients } from '../../../src/infinite-line/from-coefficients';
import { fromCoefficientsInto } from '../../../src/infinite-line/from-coefficients-into';
import { fromNormal } from '../../../src/infinite-line/from-normal';
import { fromNormalInto } from '../../../src/infinite-line/from-normal-into';
import { fromPoints } from '../../../src/infinite-line/from-points';
import { fromPointsInto } from '../../../src/infinite-line/from-points-into';
import { fromSlope } from '../../../src/infinite-line/from-slope';
import { fromSlopeInto } from '../../../src/infinite-line/from-slope-into';
import type { InfiniteLineWritable } from '../../../src/types/flat-shapes.internal';

describe('infinite-line builder - fromAngleInto / fromAngle', () => {
  test('fromAngleInto가 object origin과 angle 0 direction을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromAngleInto(out, { x: 1, y: 2 }, 0);
    expect(result).toBe(out);
    expect(out.ox).toBe(1);
    expect(out.oy).toBe(2);
    expect(out.dx).toBeCloseTo(1, 10);
    expect(out.dy).toBeCloseTo(0, 10);
  });

  test('Math.PI / 2 angle은 direction (0, 1)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Math.PI / 2);
    expect(out.dx).toBeCloseTo(0, 10);
    expect(out.dy).toBeCloseTo(1, 10);
  });

  test('-Math.PI / 2 angle은 direction (0, -1)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, -Math.PI / 2);
    expect(out.dx).toBeCloseTo(0, 10);
    expect(out.dy).toBeCloseTo(-1, 10);
  });

  test('NaN angle은 direction에 NaN을 기록한다 (Math.cos/sin NaN pass-through)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Number.NaN);
    expect(Number.isNaN(out.dx)).toBe(true);
    expect(Number.isNaN(out.dy)).toBe(true);
  });

  test('Infinity / -Infinity angle은 direction에 NaN을 기록한다 (Math.cos(Infinity) = NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.dx)).toBe(true);
    expect(Number.isNaN(out.dy)).toBe(true);

    fromAngleInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY);
    expect(Number.isNaN(out.dx)).toBe(true);
    expect(Number.isNaN(out.dy)).toBe(true);
  });

  test('fromAngle companion이 새 plain object를 반환한다', () => {
    const line = fromAngle({ x: 1, y: 2 }, 0);
    expect(line.ox).toBe(1);
    expect(line.oy).toBe(2);
    expect(line.dx).toBeCloseTo(1, 10);
    expect(line.dy).toBeCloseTo(0, 10);
  });
});

describe('infinite-line builder - fromSlopeInto / fromSlope', () => {
  test('기본 intercept 0으로 y = 2x를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromSlopeInto(out, 2);
    expect(result).toBe(out);
    expect(out).toEqual({ ox: 0, oy: 0, dx: 1, dy: 2 });
  });

  test('intercept를 y-intercept로 반영한다 (finite slope)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, 2, 5);
    expect(out).toEqual({ ox: 0, oy: 5, dx: 1, dy: 2 });
  });

  test('slope 0은 수평선 y = intercept를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, 0, 3);
    expect(out).toEqual({ ox: 0, oy: 3, dx: 1, dy: 0 });
  });

  test('Infinity slope는 수직선 x = intercept를 만든다 (intercept = x-intercept)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.POSITIVE_INFINITY, 7);
    expect(out).toEqual({ ox: 7, oy: 0, dx: 0, dy: 1 });
  });

  test('-Infinity slope도 수직선 x = intercept를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.NEGATIVE_INFINITY, -4);
    expect(out).toEqual({ ox: -4, oy: 0, dx: 0, dy: 1 });
  });

  test('NaN slope는 finite 분기로 처리되어 direction.y에 NaN을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.NaN, 2);
    expect(out.ox).toBe(0);
    expect(out.oy).toBe(2);
    expect(out.dx).toBe(1);
    expect(Number.isNaN(out.dy)).toBe(true);
  });

  test('fromSlope companion이 기본 intercept로 새 plain object를 반환한다', () => {
    const line = fromSlope(3);
    expect(line).toEqual({ ox: 0, oy: 0, dx: 1, dy: 3 });
  });

  test('fromSlope companion이 vertical slope에서 x-intercept를 반영한다', () => {
    const line = fromSlope(Number.POSITIVE_INFINITY, 7);
    expect(line).toEqual({ ox: 7, oy: 0, dx: 0, dy: 1 });
  });
});

describe('infinite-line builder - fromPointsInto / fromPoints', () => {
  test('두 object point에서 origin = a, direction = b - a를 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromPointsInto(out, { x: 1, y: 2 }, { x: 4, y: 6 });
    expect(result).toBe(out);
    expect(out).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });

  test('같은 point는 degenerate direction (0, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 5, y: 5 }, { x: 5, y: 5 });
    expect(out).toEqual({ ox: 5, oy: 5, dx: 0, dy: 0 });
  });

  test('NaN point component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 0, y: 0 }, { x: Number.NaN, y: 1 });
    expect(out.ox).toBe(0);
    expect(out.oy).toBe(0);
    expect(Number.isNaN(out.dx)).toBe(true);
    expect(out.dy).toBe(1);
  });

  test('Infinity / -Infinity point component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 0, y: 0 }, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expect(out.dx).toBe(Number.POSITIVE_INFINITY);
    expect(out.dy).toBe(Number.NEGATIVE_INFINITY);
  });

  test('Infinity - Infinity 산술은 NaN을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: Number.POSITIVE_INFINITY, y: 0 }, { x: Number.POSITIVE_INFINITY, y: 0 });
    expect(Number.isNaN(out.dx)).toBe(true);
  });

  test('fromPoints companion이 새 plain object를 반환한다', () => {
    const line = fromPoints({ x: 1, y: 2 }, { x: 4, y: 6 });
    expect(line).toEqual({ ox: 1, oy: 2, dx: 3, dy: 4 });
  });
});

describe('infinite-line builder - fromNormalInto / fromNormal', () => {
  test('normal (1, 0)은 direction (-0, 1)을 기록한다 (좌측 90도 회전, -ny signed-zero)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromNormalInto(out, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(result).toBe(out);
    // -ny = -0이 그대로 direction.x에 기록된다 (JS 산술 결과 보존)
    expect(out.ox).toBe(0);
    expect(out.oy).toBe(0);
    expect(Object.is(out.dx, -0)).toBe(true);
    expect(out.dy).toBe(1);
  });

  test('normal (0, 1)은 direction (-1, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 5, y: 6 }, { x: 0, y: 1 });
    expect(out).toEqual({ ox: 5, oy: 6, dx: -1, dy: 0 });
  });

  test('normal을 normalize하지 않는다 — scale을 그대로 direction에 유지', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: 3, y: 4 });
    expect(out.dx).toBe(-4);
    expect(out.dy).toBe(3);
  });

  test('zero normal은 degenerate direction을 기록한다 (-ny signed-zero 포함)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 5, y: 6 }, { x: 0, y: 0 });
    expect(out.ox).toBe(5);
    expect(out.oy).toBe(6);
    // direction = (-0, 0). JS 산술 결과 보존
    expect(Object.is(out.dx, -0)).toBe(true);
    expect(out.dy).toBe(0);
  });

  test('NaN normal component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: Number.NaN, y: 1 });
    // direction = (-y, x) = (-1, NaN)
    expect(out.dx).toBe(-1);
    expect(Number.isNaN(out.dy)).toBe(true);
  });

  test('Infinity / -Infinity normal component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    // direction = (-y, x) = (Infinity, Infinity)
    expect(out.dx).toBe(Number.POSITIVE_INFINITY);
    expect(out.dy).toBe(Number.POSITIVE_INFINITY);
  });

  test('fromNormal companion이 새 plain object를 반환한다', () => {
    const line = fromNormal({ x: 5, y: 6 }, { x: 1, y: 0 });
    expect(line.ox).toBe(5);
    expect(line.oy).toBe(6);
    expect(Object.is(line.dx, -0)).toBe(true);
    expect(line.dy).toBe(1);
  });
});

describe('infinite-line builder - fromCoefficientsInto / fromCoefficients', () => {
  test('수직선 x = 5: a=1, b=0, c=-5 → origin (5, 0), direction (-0, 1) (-b signed-zero)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromCoefficientsInto(out, 1, 0, -5);
    expect(result).toBe(out);
    expect(out.ox).toBe(5);
    expect(out.oy).toBe(0);
    // direction.x = -b = -0 (JS 산술 결과 보존)
    expect(Object.is(out.dx, -0)).toBe(true);
    expect(out.dy).toBe(1);
  });

  test('수평선 y = 3: a=0, b=1, c=-3 → direction (-1, 0), origin (0, 3)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 1, -3);
    expect(out).toEqual({ ox: 0, oy: 3, dx: -1, dy: 0 });
  });

  test('일반식 2x + 3y - 6 = 0: |a| < |b| 분기 → origin (0, 2), direction (-3, 2)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 2, 3, -6);
    expect(out).toEqual({ ox: 0, oy: 2, dx: -3, dy: 2 });
  });

  test('일반식 3x + 2y - 6 = 0: |a| >= |b| 분기 → origin (2, 0), direction (-2, 3)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 3, 2, -6);
    expect(out).toEqual({ ox: 2, oy: 0, dx: -2, dy: 3 });
  });

  test('|a| === |b|에서는 a 분기를 선택한다 (>= 비교)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 1, 1, -4);
    // |a| === |b|이므로 a 분기: origin = (-c/a, 0) = (4, 0)
    expect(out).toEqual({ ox: 4, oy: 0, dx: -1, dy: 1 });
  });

  test('a = 0 && b = 0은 degenerate line(0, 0) / (0, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 0, 5);
    expect(out).toEqual({ ox: 0, oy: 0, dx: 0, dy: 0 });
  });

  test('a = 0, b = 0, c = 0도 degenerate line을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 0, 0);
    expect(out).toEqual({ ox: 0, oy: 0, dx: 0, dy: 0 });
  });

  test('NaN coefficient: a=NaN, b=1, c=0 → degenerate guard false, |NaN| >= |1| false → b 분기 origin (0, -0), direction (-1, NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.NaN, 1, 0);
    // NaN 비교는 항상 false이므로 else 분기: origin = (0, -c/b) = (0, -0/1) = (0, -0)
    expect(out.ox).toBe(0);
    expect(Object.is(out.oy, -0)).toBe(true);
    expect(out.dx).toBe(-1);
    expect(Number.isNaN(out.dy)).toBe(true);
  });

  test('NaN coefficient: a=1, b=NaN, c=2 → |1| >= |NaN| false → b 분기 origin (0, -2/NaN = NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 1, Number.NaN, 2);
    // NaN 비교는 항상 false이므로 else 분기: origin = (0, -c/b) = (0, NaN), direction = (NaN, 1)
    expect(out.ox).toBe(0);
    expect(Number.isNaN(out.oy)).toBe(true);
    expect(Number.isNaN(out.dx)).toBe(true);
    expect(out.dy).toBe(1);
  });

  test('Infinity coefficient: a=Infinity, b=1, c=2 → |Infinity| >= |1| true → origin (-2/Infinity, 0) = (-0, 0)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.POSITIVE_INFINITY, 1, 2);
    // -2/Infinity = -0; -0 === 0이므로 toEqual은 통과한다
    expect(out.ox).toBe(-0);
    expect(out.oy).toBe(0);
    expect(out.dx).toBe(-1);
    expect(out.dy).toBe(Number.POSITIVE_INFINITY);
  });

  test('-Infinity coefficient: a=-Infinity, b=1, c=2 → origin (2/Infinity, 0) = (0, 0), direction (-1, -Infinity)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.NEGATIVE_INFINITY, 1, 2);
    expect(out.ox).toBe(0);
    expect(out.oy).toBe(0);
    expect(out.dx).toBe(-1);
    expect(out.dy).toBe(Number.NEGATIVE_INFINITY);
  });

  test('Infinity / Infinity 비교: a=Infinity, b=Infinity → |a| >= |b| true → origin (-c/Infinity, 0) = (-0, 0), direction (-Infinity, Infinity)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 1);
    expect(out.ox).toBe(-0);
    expect(out.oy).toBe(0);
    expect(out.dx).toBe(Number.NEGATIVE_INFINITY);
    expect(out.dy).toBe(Number.POSITIVE_INFINITY);
  });

  test('fromCoefficients companion이 새 plain object를 반환한다 (수직선)', () => {
    const line = fromCoefficients(1, 0, -5);
    expect(line.ox).toBe(5);
    expect(line.oy).toBe(0);
    // direction.x = -b = -0 (JS 산술 결과 보존)
    expect(Object.is(line.dx, -0)).toBe(true);
    expect(line.dy).toBe(1);
  });

  test('fromCoefficients companion이 degenerate(a=b=0)에서 zero line을 반환한다', () => {
    const line = fromCoefficients(0, 0, 5);
    expect(line).toEqual({ ox: 0, oy: 0, dx: 0, dy: 0 });
  });
});
