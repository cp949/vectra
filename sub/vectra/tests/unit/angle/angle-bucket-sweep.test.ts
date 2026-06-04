/**
 * angle domain bucket 판정과 sweep/reflex helper를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { clockwiseSweep } from '../../../src/angle/clockwise-sweep';
import { counterClockwiseSweep } from '../../../src/angle/counter-clockwise-sweep';
import { isReflexSweep } from '../../../src/angle/is-reflex-sweep';
import { octant } from '../../../src/angle/octant';
import { quadrant } from '../../../src/angle/quadrant';
import { sweepAngle } from '../../../src/angle/sweep-angle';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('quadrant - 사분면 bucket', () => {
  test('0 → 0이다', () => {
    expect(quadrant(0)).toBe(0);
  });

  test('π/4 → 0이다 ([0, π/2) 안)', () => {
    expect(quadrant(Math.PI / 4)).toBe(0);
  });

  test('π/2 → 1이다 (경계값은 다음 bucket)', () => {
    expect(quadrant(Math.PI / 2)).toBe(1);
  });

  test('3π/4 → 1이다', () => {
    expect(quadrant((3 * Math.PI) / 4)).toBe(1);
  });

  test('π → 2이다', () => {
    expect(quadrant(Math.PI)).toBe(2);
  });

  test('3π/2 → 3이다', () => {
    expect(quadrant((3 * Math.PI) / 2)).toBe(3);
  });

  test('-π/4 → 3이다 (7π/4로 감긴다)', () => {
    expect(quadrant(-Math.PI / 4)).toBe(3);
  });

  test('2π → 0이다 (0과 동일)', () => {
    expect(quadrant(2 * Math.PI)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => quadrant(value)).toThrow(RangeError);
  });
});

describe('octant - 팔분면 bucket', () => {
  test('0 → 0이다', () => {
    expect(octant(0)).toBe(0);
  });

  test('π/8 → 0이다 ([0, π/4) 안)', () => {
    expect(octant(Math.PI / 8)).toBe(0);
  });

  test('π/4 → 1이다 (경계값은 다음 bucket)', () => {
    expect(octant(Math.PI / 4)).toBe(1);
  });

  test('π/2 → 2이다', () => {
    expect(octant(Math.PI / 2)).toBe(2);
  });

  test('π → 4이다', () => {
    expect(octant(Math.PI)).toBe(4);
  });

  test('3π/2 → 6이다', () => {
    expect(octant((3 * Math.PI) / 2)).toBe(6);
  });

  test('7π/4 → 7이다', () => {
    expect(octant((7 * Math.PI) / 4)).toBe(7);
  });

  test('2π → 0이다 (0과 동일)', () => {
    expect(octant(2 * Math.PI)).toBe(0);
  });

  test('-π/4 → 7이다 (7π/4로 감긴다)', () => {
    expect(octant(-Math.PI / 4)).toBe(7);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => octant(value)).toThrow(RangeError);
  });
});

describe('clockwiseSweep - clockwise sweep 크기', () => {
  test('π/2에서 0까지 CW sweep은 π/2이다', () => {
    expect(clockwiseSweep(Math.PI / 2, 0)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('0에서 π/2까지 CW sweep은 3π/2이다 (긴 방향)', () => {
    expect(clockwiseSweep(0, Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 10);
  });

  test('같은 angle의 CW sweep은 0이다', () => {
    expect(clockwiseSweep(0, 0)).toBe(0);
  });

  test('π와 -π는 full-turn equivalent이므로 sweep 0이다', () => {
    expect(clockwiseSweep(Math.PI, -Math.PI)).toBe(0);
  });

  test('0에서 π까지 CW sweep은 π이다', () => {
    expect(clockwiseSweep(0, Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => clockwiseSweep(value, 0)).toThrow(RangeError);
    expect(() => clockwiseSweep(0, value)).toThrow(RangeError);
  });
});

describe('counterClockwiseSweep - counter-clockwise sweep 크기', () => {
  test('0에서 π/2까지 CCW sweep은 π/2이다', () => {
    expect(counterClockwiseSweep(0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('3π/4에서 π/4까지 CCW sweep은 3π/2이다 (wrap-around)', () => {
    expect(counterClockwiseSweep((3 * Math.PI) / 4, Math.PI / 4)).toBeCloseTo((3 * Math.PI) / 2, 10);
  });

  test('같은 angle의 CCW sweep은 0이다', () => {
    expect(counterClockwiseSweep(0, 0)).toBe(0);
  });

  test('0에서 π까지 CCW sweep은 π이다', () => {
    expect(counterClockwiseSweep(0, Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  test('π와 -π는 full-turn equivalent이므로 sweep 0이다', () => {
    expect(counterClockwiseSweep(Math.PI, -Math.PI)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => counterClockwiseSweep(value, 0)).toThrow(RangeError);
    expect(() => counterClockwiseSweep(0, value)).toThrow(RangeError);
  });
});

describe('sweepAngle - 방향 지정 sweep 크기', () => {
  test("'ccw' 방향으로 0에서 π/2의 sweep은 π/2이다", () => {
    expect(sweepAngle(0, Math.PI / 2, 'ccw')).toBeCloseTo(Math.PI / 2, 10);
  });

  test("'cw' 방향으로 π/2에서 0의 sweep은 π/2이다", () => {
    expect(sweepAngle(Math.PI / 2, 0, 'cw')).toBeCloseTo(Math.PI / 2, 10);
  });

  test("'ccw'와 'cw'는 같은 각도에서 합이 2π이다 (from !== to)", () => {
    const from = Math.PI / 4;
    const to = (3 * Math.PI) / 4;
    expect(sweepAngle(from, to, 'ccw') + sweepAngle(from, to, 'cw')).toBeCloseTo(2 * Math.PI, 10);
  });

  test("from === to인 경우 sweep은 0이다 ('ccw')", () => {
    expect(sweepAngle(Math.PI / 4, Math.PI / 4, 'ccw')).toBe(0);
  });

  test("from === to인 경우 sweep은 0이다 ('cw')", () => {
    expect(sweepAngle(Math.PI / 4, Math.PI / 4, 'cw')).toBe(0);
  });

  test('π와 -π는 full-turn equivalent이므로 sweep은 0이다', () => {
    expect(sweepAngle(Math.PI, -Math.PI, 'ccw')).toBe(0);
    expect(sweepAngle(Math.PI, -Math.PI, 'cw')).toBe(0);
  });

  test('invalid direction은 RangeError를 던진다', () => {
    expect(() => sweepAngle(0, Math.PI, 'invalid' as 'ccw')).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sweepAngle(value, 0, 'ccw')).toThrow(RangeError);
    expect(() => sweepAngle(0, value, 'ccw')).toThrow(RangeError);
  });
});

describe('isReflexSweep - reflex sweep 판정', () => {
  test('CCW sweep π/3은 reflex가 아니다', () => {
    expect(isReflexSweep(0, Math.PI / 3)).toBe(false);
  });

  test('CCW sweep 3π/2는 reflex이다', () => {
    expect(isReflexSweep(0, (3 * Math.PI) / 2)).toBe(true);
  });

  test('정확히 π인 sweep은 reflex가 아니다', () => {
    expect(isReflexSweep(0, Math.PI)).toBe(false);
  });

  test('같은 angle은 sweep 0이므로 false이다', () => {
    expect(isReflexSweep(Math.PI / 4, Math.PI / 4)).toBe(false);
  });

  test("기본 direction은 'ccw'이다", () => {
    // CW로는 reflex이지만 CCW로는 아닌 경우
    expect(isReflexSweep(0, Math.PI / 4)).toBe(false);
  });

  test("explicit 'cw': 0에서 π/4까지 CW sweep은 7π/4로 reflex이다", () => {
    expect(isReflexSweep(0, Math.PI / 4, 'cw')).toBe(true);
  });

  test("explicit 'cw': 정확히 π인 CW sweep은 reflex가 아니다", () => {
    // rawSweepCw(0, π) = positiveModulo(0-π, 2π) = π, π > π는 false
    expect(isReflexSweep(0, Math.PI, 'cw')).toBe(false);
  });

  test("explicit 'cw': 0에서 3π/2까지 CW sweep은 π/2로 reflex가 아니다", () => {
    expect(isReflexSweep(0, (3 * Math.PI) / 2, 'cw')).toBe(false);
  });

  test('invalid direction은 RangeError를 던진다', () => {
    expect(() => isReflexSweep(0, Math.PI, 'invalid' as 'ccw')).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isReflexSweep(value, 0)).toThrow(RangeError);
    expect(() => isReflexSweep(0, value)).toThrow(RangeError);
  });
});
