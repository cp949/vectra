/**
 * infinite-line coordinate/equation builder unit test.
 *
 * fromAngle*, fromSlope*, fromPoints*, fromNormal*, fromCoefficients* 쌍의 success,
 * tuple input, aliasing, degenerate fallback, non-finite pass-through, vertical slope,
 * invalid coefficient fallback을 고정한다.
 */

import { describe, expect, expectTypeOf, test } from 'vitest';
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
import type { InfiniteLineWritable } from '../../../src/types';

describe('infinite-line builder - fromAngleInto / fromAngle', () => {
  test('fromAngleInto가 object origin과 angle 0 direction을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromAngleInto(out, { x: 1, y: 2 }, 0);
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 1, y: 2 });
    expect(out.direction.x).toBeCloseTo(1, 10);
    expect(out.direction.y).toBeCloseTo(0, 10);
  });

  test('fromAngleInto가 tuple origin을 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, [3, 4], 0);
    expect(out.origin).toEqual({ x: 3, y: 4 });
  });

  test('Math.PI / 2 angle은 direction (0, 1)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Math.PI / 2);
    expect(out.direction.x).toBeCloseTo(0, 10);
    expect(out.direction.y).toBeCloseTo(1, 10);
  });

  test('-Math.PI / 2 angle은 direction (0, -1)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, -Math.PI / 2);
    expect(out.direction.x).toBeCloseTo(0, 10);
    expect(out.direction.y).toBeCloseTo(-1, 10);
  });

  test('mutable tuple nested writable type을 보존한다', () => {
    const out = { origin: [0, 0] as [number, number], direction: [0, 0] as [number, number] };
    const result = fromAngleInto(out, [1, 2], 0);
    expect(result).toBe(out);
    expect(out.origin).toEqual([1, 2]);
    expectTypeOf(result.origin).toEqualTypeOf<[number, number]>();
  });

  test('out.origin이 origin input과 alias되어도 안전하다', () => {
    const origin = { x: 5, y: 6 };
    const out: InfiniteLineWritable = { origin, direction: { x: 0, y: 0 } };
    fromAngleInto(out, origin, 0);
    expect(out.origin).toEqual({ x: 5, y: 6 });
    expect(out.direction.x).toBeCloseTo(1, 10);
    expect(out.direction.y).toBeCloseTo(0, 10);
  });

  test('NaN angle은 direction에 NaN을 기록한다 (Math.cos/sin NaN pass-through)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Number.NaN);
    expect(Number.isNaN(out.direction.x)).toBe(true);
    expect(Number.isNaN(out.direction.y)).toBe(true);
  });

  test('Infinity / -Infinity angle은 direction에 NaN을 기록한다 (Math.cos(Infinity) = NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromAngleInto(out, { x: 0, y: 0 }, Number.POSITIVE_INFINITY);
    expect(Number.isNaN(out.direction.x)).toBe(true);
    expect(Number.isNaN(out.direction.y)).toBe(true);

    fromAngleInto(out, { x: 0, y: 0 }, Number.NEGATIVE_INFINITY);
    expect(Number.isNaN(out.direction.x)).toBe(true);
    expect(Number.isNaN(out.direction.y)).toBe(true);
  });

  test('fromAngle companion이 새 plain object를 반환한다', () => {
    const line = fromAngle({ x: 1, y: 2 }, 0);
    expect(line.origin).toEqual({ x: 1, y: 2 });
    expect(line.direction.x).toBeCloseTo(1, 10);
    expect(line.direction.y).toBeCloseTo(0, 10);
  });
});

describe('infinite-line builder - fromSlopeInto / fromSlope', () => {
  test('기본 intercept 0으로 y = 2x를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromSlopeInto(out, 2);
    expect(result).toBe(out);
    expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 2 } });
  });

  test('intercept를 y-intercept로 반영한다 (finite slope)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, 2, 5);
    expect(out).toEqual({ origin: { x: 0, y: 5 }, direction: { x: 1, y: 2 } });
  });

  test('slope 0은 수평선 y = intercept를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, 0, 3);
    expect(out).toEqual({ origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } });
  });

  test('Infinity slope는 수직선 x = intercept를 만든다 (intercept = x-intercept)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.POSITIVE_INFINITY, 7);
    expect(out).toEqual({ origin: { x: 7, y: 0 }, direction: { x: 0, y: 1 } });
  });

  test('-Infinity slope도 수직선 x = intercept를 만든다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.NEGATIVE_INFINITY, -4);
    expect(out).toEqual({ origin: { x: -4, y: 0 }, direction: { x: 0, y: 1 } });
  });

  test('NaN slope는 finite 분기로 처리되어 direction.y에 NaN을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromSlopeInto(out, Number.NaN, 2);
    expect(out.origin).toEqual({ x: 0, y: 2 });
    expect(out.direction.x).toBe(1);
    expect(Number.isNaN(out.direction.y)).toBe(true);
  });

  test('mutable tuple nested writable type을 보존한다', () => {
    const out = { origin: [0, 0] as [number, number], direction: [0, 0] as [number, number] };
    const result = fromSlopeInto(out, 2, 5);
    expect(result).toBe(out);
    expect(out.origin).toEqual([0, 5]);
    expect(out.direction).toEqual([1, 2]);
    expectTypeOf(result.direction).toEqualTypeOf<[number, number]>();
  });

  test('fromSlope companion이 기본 intercept로 새 plain object를 반환한다', () => {
    const line = fromSlope(3);
    expect(line).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 3 } });
  });

  test('fromSlope companion이 vertical slope에서 x-intercept를 반영한다', () => {
    const line = fromSlope(Number.POSITIVE_INFINITY, 7);
    expect(line).toEqual({ origin: { x: 7, y: 0 }, direction: { x: 0, y: 1 } });
  });
});

describe('infinite-line builder - fromPointsInto / fromPoints', () => {
  test('두 object point에서 origin = a, direction = b - a를 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromPointsInto(out, { x: 1, y: 2 }, { x: 4, y: 6 });
    expect(result).toBe(out);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('tuple point도 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, [0, 0], [3, 4]);
    expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } });
  });

  test('같은 point는 degenerate direction (0, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 5, y: 5 }, { x: 5, y: 5 });
    expect(out).toEqual({ origin: { x: 5, y: 5 }, direction: { x: 0, y: 0 } });
  });

  test('out.origin이 a input과 alias되어도 안전하다', () => {
    const a = { x: 1, y: 2 };
    const out: InfiniteLineWritable = { origin: a, direction: { x: 0, y: 0 } };
    fromPointsInto(out, a, { x: 4, y: 6 });
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('out.direction이 b input과 alias되어도 안전하다', () => {
    const b = { x: 4, y: 6 };
    const out: InfiniteLineWritable = { origin: { x: 0, y: 0 }, direction: b };
    fromPointsInto(out, { x: 1, y: 2 }, b);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });

  test('NaN point component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 0, y: 0 }, { x: Number.NaN, y: 1 });
    expect(out.origin).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(out.direction.x)).toBe(true);
    expect(out.direction.y).toBe(1);
  });

  test('Infinity / -Infinity point component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: 0, y: 0 }, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    expect(out.direction.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.direction.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('Infinity - Infinity 산술은 NaN을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromPointsInto(out, { x: Number.POSITIVE_INFINITY, y: 0 }, { x: Number.POSITIVE_INFINITY, y: 0 });
    expect(Number.isNaN(out.direction.x)).toBe(true);
  });

  test('fromPoints companion이 새 plain object를 반환한다', () => {
    const line = fromPoints({ x: 1, y: 2 }, { x: 4, y: 6 });
    expect(line).toEqual({ origin: { x: 1, y: 2 }, direction: { x: 3, y: 4 } });
  });
});

describe('infinite-line builder - fromNormalInto / fromNormal', () => {
  test('normal (1, 0)은 direction (-0, 1)을 기록한다 (좌측 90도 회전, -ny signed-zero)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromNormalInto(out, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(result).toBe(out);
    // -ny = -0이 그대로 direction.x에 기록된다 (JS 산술 결과 보존)
    expect(out.origin).toEqual({ x: 0, y: 0 });
    expect(Object.is(out.direction.x, -0)).toBe(true);
    expect(out.direction.y).toBe(1);
  });

  test('normal (0, 1)은 direction (-1, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 5, y: 6 }, { x: 0, y: 1 });
    expect(out).toEqual({ origin: { x: 5, y: 6 }, direction: { x: -1, y: 0 } });
  });

  test('normal을 normalize하지 않는다 — scale을 그대로 direction에 유지', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: 3, y: 4 });
    expect(out.direction).toEqual({ x: -4, y: 3 });
  });

  test('tuple origin과 tuple normal을 읽는다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, [1, 2], [3, 4]);
    expect(out).toEqual({ origin: { x: 1, y: 2 }, direction: { x: -4, y: 3 } });
  });

  test('zero normal은 degenerate direction을 기록한다 (-ny signed-zero 포함)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 5, y: 6 }, { x: 0, y: 0 });
    expect(out.origin).toEqual({ x: 5, y: 6 });
    // direction = (-0, 0). JS 산술 결과 보존
    expect(Object.is(out.direction.x, -0)).toBe(true);
    expect(out.direction.y).toBe(0);
  });

  test('NaN normal component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: Number.NaN, y: 1 });
    // direction = (-y, x) = (-1, NaN)
    expect(out.direction.x).toBe(-1);
    expect(Number.isNaN(out.direction.y)).toBe(true);
  });

  test('Infinity / -Infinity normal component가 direction에 전파된다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromNormalInto(out, { x: 0, y: 0 }, { x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY });
    // direction = (-y, x) = (Infinity, Infinity)
    expect(out.direction.x).toBe(Number.POSITIVE_INFINITY);
    expect(out.direction.y).toBe(Number.POSITIVE_INFINITY);
  });

  test('out.origin이 origin input과 alias되어도 안전하다', () => {
    const origin = { x: 5, y: 6 };
    const out: InfiniteLineWritable = { origin, direction: { x: 0, y: 0 } };
    fromNormalInto(out, origin, { x: 1, y: 0 });
    expect(out.origin).toEqual({ x: 5, y: 6 });
    // direction.x = -ny = -0 (JS 산술 결과 보존)
    expect(Object.is(out.direction.x, -0)).toBe(true);
    expect(out.direction.y).toBe(1);
  });

  test('fromNormal companion이 새 plain object를 반환한다', () => {
    const line = fromNormal({ x: 5, y: 6 }, { x: 1, y: 0 });
    expect(line.origin).toEqual({ x: 5, y: 6 });
    expect(Object.is(line.direction.x, -0)).toBe(true);
    expect(line.direction.y).toBe(1);
  });
});

describe('infinite-line builder - fromCoefficientsInto / fromCoefficients', () => {
  test('수직선 x = 5: a=1, b=0, c=-5 → origin (5, 0), direction (-0, 1) (-b signed-zero)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    const result = fromCoefficientsInto(out, 1, 0, -5);
    expect(result).toBe(out);
    expect(out.origin).toEqual({ x: 5, y: 0 });
    // direction.x = -b = -0 (JS 산술 결과 보존)
    expect(Object.is(out.direction.x, -0)).toBe(true);
    expect(out.direction.y).toBe(1);
  });

  test('수평선 y = 3: a=0, b=1, c=-3 → direction (-1, 0), origin (0, 3)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 1, -3);
    expect(out).toEqual({ origin: { x: 0, y: 3 }, direction: { x: -1, y: 0 } });
  });

  test('일반식 2x + 3y - 6 = 0: |a| < |b| 분기 → origin (0, 2), direction (-3, 2)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 2, 3, -6);
    expect(out).toEqual({ origin: { x: 0, y: 2 }, direction: { x: -3, y: 2 } });
  });

  test('일반식 3x + 2y - 6 = 0: |a| >= |b| 분기 → origin (2, 0), direction (-2, 3)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 3, 2, -6);
    expect(out).toEqual({ origin: { x: 2, y: 0 }, direction: { x: -2, y: 3 } });
  });

  test('|a| === |b|에서는 a 분기를 선택한다 (>= 비교)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 1, 1, -4);
    // |a| === |b|이므로 a 분기: origin = (-c/a, 0) = (4, 0)
    expect(out).toEqual({ origin: { x: 4, y: 0 }, direction: { x: -1, y: 1 } });
  });

  test('a = 0 && b = 0은 degenerate line(0, 0) / (0, 0)을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 0, 5);
    expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } });
  });

  test('a = 0, b = 0, c = 0도 degenerate line을 기록한다', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 0, 0, 0);
    expect(out).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } });
  });

  test('NaN coefficient: a=NaN, b=1, c=0 → degenerate guard false, |NaN| >= |1| false → b 분기 origin (0, -0), direction (-1, NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.NaN, 1, 0);
    // NaN 비교는 항상 false이므로 else 분기: origin = (0, -c/b) = (0, -0/1) = (0, -0)
    expect(out.origin.x).toBe(0);
    expect(Object.is(out.origin.y, -0)).toBe(true);
    expect(out.direction.x).toBe(-1);
    expect(Number.isNaN(out.direction.y)).toBe(true);
  });

  test('NaN coefficient: a=1, b=NaN, c=2 → |1| >= |NaN| false → b 분기 origin (0, -2/NaN = NaN)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, 1, Number.NaN, 2);
    // NaN 비교는 항상 false이므로 else 분기: origin = (0, -c/b) = (0, NaN), direction = (NaN, 1)
    expect(out.origin.x).toBe(0);
    expect(Number.isNaN(out.origin.y)).toBe(true);
    expect(Number.isNaN(out.direction.x)).toBe(true);
    expect(out.direction.y).toBe(1);
  });

  test('Infinity coefficient: a=Infinity, b=1, c=2 → |Infinity| >= |1| true → origin (-2/Infinity, 0) = (-0, 0)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.POSITIVE_INFINITY, 1, 2);
    // -2/Infinity = -0; -0 === 0이므로 toEqual은 통과한다
    expect(out.origin).toEqual({ x: -0, y: 0 });
    expect(out.direction).toEqual({ x: -1, y: Number.POSITIVE_INFINITY });
  });

  test('-Infinity coefficient: a=-Infinity, b=1, c=2 → origin (2/Infinity, 0) = (0, 0), direction (-1, -Infinity)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.NEGATIVE_INFINITY, 1, 2);
    expect(out.origin).toEqual({ x: 0, y: 0 });
    expect(out.direction.x).toBe(-1);
    expect(out.direction.y).toBe(Number.NEGATIVE_INFINITY);
  });

  test('Infinity / Infinity 비교: a=Infinity, b=Infinity → |a| >= |b| true → origin (-c/Infinity, 0) = (-0, 0), direction (-Infinity, Infinity)', () => {
    const out: InfiniteLineWritable = createInfiniteLine();
    fromCoefficientsInto(out, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 1);
    expect(out.origin).toEqual({ x: -0, y: 0 });
    expect(out.direction.x).toBe(Number.NEGATIVE_INFINITY);
    expect(out.direction.y).toBe(Number.POSITIVE_INFINITY);
  });

  test('fromCoefficients companion이 새 plain object를 반환한다 (수직선)', () => {
    const line = fromCoefficients(1, 0, -5);
    expect(line.origin).toEqual({ x: 5, y: 0 });
    // direction.x = -b = -0 (JS 산술 결과 보존)
    expect(Object.is(line.direction.x, -0)).toBe(true);
    expect(line.direction.y).toBe(1);
  });

  test('fromCoefficients companion이 degenerate(a=b=0)에서 zero line을 반환한다', () => {
    const line = fromCoefficients(0, 0, 5);
    expect(line).toEqual({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } });
  });
});
