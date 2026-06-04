import { describe, expect, test } from 'vitest';
import * as math from '../../../src/math';

describe('math barrel 재노출', () => {
  test('range/interpolation 함수를 re-export한다', () => {
    expect(math.clamp(11, 0, 10)).toBe(10);
    expect(math.difference(10, 4)).toBe(6);
    expect(math.fromPercent(0.25, 100, 200)).toBe(125);
    expect(math.within(5, 0, 10)).toBe(true);
    expect(math.lerp(0, 10, 0.5)).toBe(5);
    expect(math.inverseLerp(0, 10, 5)).toBe(0.5);
    expect(math.maxAdd(8, 5, 10)).toBe(10);
    expect(math.minSub(4, 10, 0)).toBe(0);
    expect(math.percent(5, 0, 10)).toBe(0.5);
    expect(math.remap(5, 0, 10, 0, 100)).toBe(50);
  });

  test('snap helper 함수를 re-export한다', () => {
    expect(math.snapTo(13, 5)).toBe(15);
    expect(math.snapFloor(13, 5)).toBe(10);
    expect(math.snapCeil(13, 5)).toBe(15);
  });

  test('rounding helper 함수를 re-export한다', () => {
    expect(math.roundTo(12.345, 2)).toBe(12.35);
    expect(math.floorTo(12.349, 2)).toBe(12.34);
    expect(math.ceilTo(12.341, 2)).toBe(12.35);
    expect(math.roundAwayFromZero(-1.2)).toBe(-2);
  });

  test('fuzzy helper 함수를 re-export한다', () => {
    expect(math.fuzzyEqual(1, 1 + 5e-10)).toBe(true);
    expect(math.fuzzyLessThan(10.4, 10, 0.5)).toBe(true);
    expect(math.fuzzyGreaterThan(9.6, 10, 0.5)).toBe(true);
    expect(math.fuzzyFloor(3.9996, 0.001)).toBe(4);
    expect(math.fuzzyCeil(4.0004, 0.001)).toBe(4);
  });

  test('wrap family 함수를 re-export하고 모호한 wrap은 제공하지 않는다', () => {
    expect(math.wrapFloatHalfOpen(10, 0, 10)).toBe(0);
    expect(math.wrapIntHalfOpen(-1, 0, 10)).toBe(9);
    expect(math.wrapIntInclusive(-1, 0, 10)).toBe(10);
    expect(math.wrapRange(25, 10, 20)).toBe(15);
    expect('wrap' in math).toBe(false);
    expect('wrapFloatInclusive' in math).toBe(false);
  });

  test('periodic scalar helper 함수를 re-export한다', () => {
    expect(math.cycle(7, 5)).toBe(2);
    expect(math.pingPong(7, 5)).toBe(3);
    expect(math.sawtoothWave(2.5)).toBe(0.5);
    expect(math.squareWave(0.25)).toBe(1);
    expect(math.triangleWave(0.5)).toBe(1);
  });
});
