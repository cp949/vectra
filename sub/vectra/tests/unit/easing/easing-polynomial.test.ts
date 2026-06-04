import { describe, expect, test } from 'vitest';
import { cubicIn, cubicInOut, cubicOut } from '../../../src/easing/cubic';
import { powerIn, powerInOut, powerOut } from '../../../src/easing/power';
import { quadIn, quadInOut, quadOut } from '../../../src/easing/quad';
import { quartIn, quartInOut, quartOut } from '../../../src/easing/quart';
import { quintIn, quintInOut, quintOut } from '../../../src/easing/quint';
import { nonFiniteValues } from './easing-test-helpers';

describe('easing - powerIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(powerIn(0, 2)).toBe(0);
    expect(powerIn(1, 2)).toBe(1);
    expect(powerIn(0, 3)).toBe(0);
    expect(powerIn(1, 3)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(powerIn(0.5, 2)).toBe(0.25);
    expect(powerIn(0.5, 3)).toBe(0.125);
    expect(powerIn(0.5, 4)).toBe(0.0625);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => powerIn(value, 2)).toThrow(RangeError);
  });

  test('exponent가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => powerIn(0.5, 0)).toThrow(RangeError);
    expect(() => powerIn(0.5, -1)).toThrow(RangeError);
    expect(() => powerIn(0.5, Number.NaN)).toThrow(RangeError);
    expect(() => powerIn(0.5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('easing - powerOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(powerOut(0, 2)).toBe(0);
    expect(powerOut(1, 2)).toBe(1);
    expect(powerOut(0, 3)).toBe(0);
    expect(powerOut(1, 3)).toBe(1);
  });

  test('대표 값이 수식과 일치한다', () => {
    expect(powerOut(0.5, 2)).toBe(0.75);
    expect(powerOut(0.5, 3)).toBe(0.875);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => powerOut(value, 2)).toThrow(RangeError);
  });

  test('exponent가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => powerOut(0.5, 0)).toThrow(RangeError);
    expect(() => powerOut(0.5, -1)).toThrow(RangeError);
    expect(() => powerOut(0.5, Number.NaN)).toThrow(RangeError);
  });
});

describe('easing - powerInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(powerInOut(0, 2)).toBe(0);
    expect(powerInOut(1, 2)).toBe(1);
    expect(powerInOut(0, 3)).toBe(0);
    expect(powerInOut(1, 3)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(powerInOut(0.5, 2)).toBe(0.5);
    expect(powerInOut(0.5, 3)).toBe(0.5);
  });

  test('t < 0.5 구간에서 수식과 일치한다', () => {
    const t = 0.25;
    expect(powerInOut(t, 2)).toBe((2 * t) ** 2 / 2);
  });

  test('t >= 0.5 구간에서 수식과 일치한다', () => {
    const t = 0.75;
    expect(powerInOut(t, 2)).toBe(1 - (2 - 2 * t) ** 2 / 2);
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => powerInOut(value, 2)).toThrow(RangeError);
  });

  test('exponent가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => powerInOut(0.5, 0)).toThrow(RangeError);
    expect(() => powerInOut(0.5, -1)).toThrow(RangeError);
  });
});

describe('easing - quadIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quadIn(0)).toBe(0);
    expect(quadIn(1)).toBe(1);
  });

  test('powerIn(t, 2)와 동일한 결과를 반환한다', () => {
    expect(quadIn(0.25)).toBe(powerIn(0.25, 2));
    expect(quadIn(0.5)).toBe(powerIn(0.5, 2));
    expect(quadIn(0.75)).toBe(powerIn(0.75, 2));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quadIn(value)).toThrow(RangeError);
  });
});

describe('easing - quadOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quadOut(0)).toBe(0);
    expect(quadOut(1)).toBe(1);
  });

  test('powerOut(t, 2)와 동일한 결과를 반환한다', () => {
    expect(quadOut(0.5)).toBe(powerOut(0.5, 2));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quadOut(value)).toThrow(RangeError);
  });
});

describe('easing - quadInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quadInOut(0)).toBe(0);
    expect(quadInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(quadInOut(0.5)).toBe(0.5);
  });

  test('powerInOut(t, 2)와 동일한 결과를 반환한다', () => {
    expect(quadInOut(0.25)).toBe(powerInOut(0.25, 2));
    expect(quadInOut(0.75)).toBe(powerInOut(0.75, 2));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quadInOut(value)).toThrow(RangeError);
  });
});

describe('easing - cubicIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(cubicIn(0)).toBe(0);
    expect(cubicIn(1)).toBe(1);
  });

  test('powerIn(t, 3)와 동일한 결과를 반환한다', () => {
    expect(cubicIn(0.5)).toBe(powerIn(0.5, 3));
    expect(cubicIn(0.75)).toBe(powerIn(0.75, 3));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => cubicIn(value)).toThrow(RangeError);
  });
});

describe('easing - cubicOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(cubicOut(0)).toBe(0);
    expect(cubicOut(1)).toBe(1);
  });

  test('powerOut(t, 3)와 동일한 결과를 반환한다', () => {
    expect(cubicOut(0.5)).toBe(powerOut(0.5, 3));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => cubicOut(value)).toThrow(RangeError);
  });
});

describe('easing - cubicInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(cubicInOut(0)).toBe(0);
    expect(cubicInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(cubicInOut(0.5)).toBe(0.5);
  });

  test('powerInOut(t, 3)와 동일한 결과를 반환한다', () => {
    expect(cubicInOut(0.25)).toBe(powerInOut(0.25, 3));
    expect(cubicInOut(0.75)).toBe(powerInOut(0.75, 3));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => cubicInOut(value)).toThrow(RangeError);
  });
});

describe('easing - quartIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quartIn(0)).toBe(0);
    expect(quartIn(1)).toBe(1);
  });

  test('powerIn(t, 4)와 동일한 결과를 반환한다', () => {
    expect(quartIn(0.5)).toBe(powerIn(0.5, 4));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quartIn(value)).toThrow(RangeError);
  });
});

describe('easing - quartOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quartOut(0)).toBe(0);
    expect(quartOut(1)).toBe(1);
  });

  test('powerOut(t, 4)와 동일한 결과를 반환한다', () => {
    expect(quartOut(0.5)).toBe(powerOut(0.5, 4));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quartOut(value)).toThrow(RangeError);
  });
});

describe('easing - quartInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quartInOut(0)).toBe(0);
    expect(quartInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(quartInOut(0.5)).toBe(0.5);
  });

  test('powerInOut(t, 4)와 동일한 결과를 반환한다', () => {
    expect(quartInOut(0.25)).toBe(powerInOut(0.25, 4));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quartInOut(value)).toThrow(RangeError);
  });
});

describe('easing - quintIn', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quintIn(0)).toBe(0);
    expect(quintIn(1)).toBe(1);
  });

  test('powerIn(t, 5)와 동일한 결과를 반환한다', () => {
    expect(quintIn(0.5)).toBe(powerIn(0.5, 5));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quintIn(value)).toThrow(RangeError);
  });
});

describe('easing - quintOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quintOut(0)).toBe(0);
    expect(quintOut(1)).toBe(1);
  });

  test('powerOut(t, 5)와 동일한 결과를 반환한다', () => {
    expect(quintOut(0.5)).toBe(powerOut(0.5, 5));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quintOut(value)).toThrow(RangeError);
  });
});

describe('easing - quintInOut', () => {
  test('endpoint가 정확히 0과 1이다', () => {
    expect(quintInOut(0)).toBe(0);
    expect(quintInOut(1)).toBe(1);
  });

  test('midpoint t=0.5에서 0.5를 반환한다', () => {
    expect(quintInOut(0.5)).toBe(0.5);
  });

  test('powerInOut(t, 5)와 동일한 결과를 반환한다', () => {
    expect(quintInOut(0.25)).toBe(powerInOut(0.25, 5));
  });

  test.each(nonFiniteValues)('비finite t %s는 RangeError를 던진다', (value) => {
    expect(() => quintInOut(value)).toThrow(RangeError);
  });
});
