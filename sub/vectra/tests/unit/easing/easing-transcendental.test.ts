import { describe, expect, test } from 'vitest';
import { circIn, circInOut, circOut } from '../../../src/easing/circ';
import { expoIn, expoInOut, expoOut } from '../../../src/easing/expo';
import { sineIn, sineInOut, sineOut } from '../../../src/easing/sine';
import { nonFiniteValues } from './easing-test-helpers';

describe('easing - sineIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(sineIn(0)).toBe(0);
    expect(sineIn(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(sineIn(0.5)).toBeCloseTo(1 - Math.cos((0.5 * Math.PI) / 2), 14);
    expect(sineIn(0.25)).toBeCloseTo(1 - Math.cos((0.25 * Math.PI) / 2), 14);
    expect(sineIn(0.75)).toBeCloseTo(1 - Math.cos((0.75 * Math.PI) / 2), 14);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => sineIn(value)).toThrow(RangeError);
  });
});

describe('easing - sineOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(sineOut(0)).toBe(0);
    expect(sineOut(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(sineOut(0.5)).toBeCloseTo(Math.sin((0.5 * Math.PI) / 2), 14);
    expect(sineOut(0.25)).toBeCloseTo(Math.sin((0.25 * Math.PI) / 2), 14);
    expect(sineOut(0.75)).toBeCloseTo(Math.sin((0.75 * Math.PI) / 2), 14);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => sineOut(value)).toThrow(RangeError);
  });
});

describe('easing - sineInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(sineInOut(0)).toBe(0);
    expect(sineInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(sineInOut(0.5)).toBe(0.5);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(sineInOut(0.25)).toBeCloseTo(-(Math.cos(Math.PI * 0.25) - 1) / 2, 14);
    expect(sineInOut(0.75)).toBeCloseTo(-(Math.cos(Math.PI * 0.75) - 1) / 2, 14);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => sineInOut(value)).toThrow(RangeError);
  });
});

describe('easing - expoIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(expoIn(0)).toBe(0);
    expect(expoIn(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(expoIn(0.5)).toBe(2 ** (10 * 0.5 - 10));
    expect(expoIn(0.25)).toBe(2 ** (10 * 0.25 - 10));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => expoIn(value)).toThrow(RangeError);
  });
});

describe('easing - expoOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(expoOut(0)).toBe(0);
    expect(expoOut(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(expoOut(0.5)).toBe(1 - 2 ** (-10 * 0.5));
    expect(expoOut(0.75)).toBe(1 - 2 ** (-10 * 0.75));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => expoOut(value)).toThrow(RangeError);
  });
});

describe('easing - expoInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(expoInOut(0)).toBe(0);
    expect(expoInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(expoInOut(0.5)).toBe(0.5);
  });

  test('t < 0.5 구간에서 수식과 일치한다', () => {
    expect(expoInOut(0.25)).toBe(2 ** (20 * 0.25 - 10) / 2);
  });

  test('t > 0.5 구간에서 수식과 일치한다', () => {
    expect(expoInOut(0.75)).toBe((2 - 2 ** (-20 * 0.75 + 10)) / 2);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => expoInOut(value)).toThrow(RangeError);
  });
});

describe('easing - circIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(circIn(0)).toBe(0);
    expect(circIn(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(circIn(0.5)).toBe(1 - Math.sqrt(1 - 0.5 * 0.5));
    expect(circIn(0.25)).toBe(1 - Math.sqrt(1 - 0.25 * 0.25));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => circIn(value)).toThrow(RangeError);
  });
});

describe('easing - circOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(circOut(0)).toBe(0);
    expect(circOut(1)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(circOut(0.5)).toBe(Math.sqrt(1 - (0.5 - 1) ** 2));
    expect(circOut(0.75)).toBe(Math.sqrt(1 - (0.75 - 1) ** 2));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => circOut(value)).toThrow(RangeError);
  });
});

describe('easing - circInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(circInOut(0)).toBe(0);
    expect(circInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(circInOut(0.5)).toBe(0.5);
  });

  test('t < 0.5 구간에서 수식과 일치한다', () => {
    expect(circInOut(0.25)).toBe((1 - Math.sqrt(1 - (2 * 0.25) ** 2)) / 2);
  });

  test('t >= 0.5 구간에서 수식과 일치한다', () => {
    expect(circInOut(0.75)).toBe((Math.sqrt(1 - (-2 * 0.75 + 2) ** 2) + 1) / 2);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => circInOut(value)).toThrow(RangeError);
  });
});
