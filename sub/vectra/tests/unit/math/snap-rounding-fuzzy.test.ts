import { describe, expect, test } from 'vitest';
import { ceilTo } from '../../../src/math/ceil-to';
import { floorTo } from '../../../src/math/floor-to';
import { fuzzyCeil } from '../../../src/math/fuzzy-ceil';
import { fuzzyEqual } from '../../../src/math/fuzzy-equal';
import { fuzzyEqualScaled } from '../../../src/math/fuzzy-equal-scaled';
import { fuzzyFloor } from '../../../src/math/fuzzy-floor';
import { fuzzyGreaterThan } from '../../../src/math/fuzzy-greater-than';
import { fuzzyLessThan } from '../../../src/math/fuzzy-less-than';
import { roundAwayFromZero } from '../../../src/math/round-away-from-zero';
import { roundTo } from '../../../src/math/round-to';
import { snapCeil } from '../../../src/math/snap-ceil';
import { snapFloor } from '../../../src/math/snap-floor';
import { snapTo } from '../../../src/math/snap-to';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('math snap - snapTo', () => {
  test('가장 가까운 gap 단위로 값을 맞춘다', () => {
    expect(snapTo(12, 5)).toBe(10);
    expect(snapTo(13, 5)).toBe(15);
    expect(snapTo(-12, 5)).toBe(-10);
  });

  test('custom start를 기준점으로 사용한다', () => {
    expect(snapTo(14, 5, 2)).toBe(12);
    expect(snapTo(15, 5, 2)).toBe(17);
  });

  test('gap이 양수가 아니면 RangeError를 던진다', () => {
    expect(() => snapTo(1, 0)).toThrow(RangeError);
    expect(() => snapTo(1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => snapTo(value, 1)).toThrow(RangeError);
    expect(() => snapTo(0, value)).toThrow(RangeError);
    expect(() => snapTo(0, 1, value)).toThrow(RangeError);
  });
});

describe('math snap - snapFloor', () => {
  test('값보다 크지 않은 gap 단위로 값을 맞춘다', () => {
    expect(snapFloor(12, 5)).toBe(10);
    expect(snapFloor(13, 5)).toBe(10);
    expect(snapFloor(-12, 5)).toBe(-15);
  });

  test('custom start를 기준점으로 사용한다', () => {
    expect(snapFloor(14, 5, 2)).toBe(12);
    expect(snapFloor(16, 5, 2)).toBe(12);
  });

  test('gap이 양수가 아니면 RangeError를 던진다', () => {
    expect(() => snapFloor(1, 0)).toThrow(RangeError);
    expect(() => snapFloor(1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => snapFloor(value, 1)).toThrow(RangeError);
    expect(() => snapFloor(0, value)).toThrow(RangeError);
    expect(() => snapFloor(0, 1, value)).toThrow(RangeError);
  });
});

describe('math snap - snapCeil', () => {
  test('값보다 작지 않은 gap 단위로 값을 맞춘다', () => {
    expect(snapCeil(12, 5)).toBe(15);
    expect(snapCeil(13, 5)).toBe(15);
    expect(snapCeil(-12, 5)).toBe(-10);
  });

  test('custom start를 기준점으로 사용한다', () => {
    expect(snapCeil(13, 5, 2)).toBe(17);
    expect(snapCeil(17, 5, 2)).toBe(17);
  });

  test('gap이 양수가 아니면 RangeError를 던진다', () => {
    expect(() => snapCeil(1, 0)).toThrow(RangeError);
    expect(() => snapCeil(1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => snapCeil(value, 1)).toThrow(RangeError);
    expect(() => snapCeil(0, value)).toThrow(RangeError);
    expect(() => snapCeil(0, 1, value)).toThrow(RangeError);
  });
});

describe('math rounding - roundTo', () => {
  test('base 10 place 정밀도에 맞춰 반올림한다', () => {
    expect(roundTo(12.345, 2)).toBe(12.35);
    expect(roundTo(12.344, 2)).toBe(12.34);
    expect(roundTo(285.714, -2)).toBe(300);
  });

  test('custom base를 사용해 정밀도를 계산한다', () => {
    expect(roundTo(5.74, 1, 2)).toBe(5.5);
    expect(roundTo(5.74, -1, 2)).toBe(6);
  });

  test('place와 base가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => roundTo(1, 0.5)).toThrow(RangeError);
    expect(() => roundTo(1, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
    expect(() => roundTo(1, 1, 0)).toThrow(RangeError);
    expect(() => roundTo(1, 1, -10)).toThrow(RangeError);
    expect(() => roundTo(1, 1, 1)).toThrow(RangeError);
    expect(() => roundTo(1, 400, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => roundTo(value, 1)).toThrow(RangeError);
    expect(() => roundTo(0, value)).toThrow(RangeError);
    expect(() => roundTo(0, 1, value)).toThrow(RangeError);
  });
});

describe('math rounding - floorTo', () => {
  test('base 10 place 정밀도에 맞춰 내림한다', () => {
    expect(floorTo(12.349, 2)).toBe(12.34);
    expect(floorTo(285.714, -2)).toBe(200);
    expect(floorTo(-12.341, 2)).toBe(-12.35);
  });

  test('custom base를 사용해 정밀도를 계산한다', () => {
    expect(floorTo(5.74, 1, 2)).toBe(5.5);
    expect(floorTo(5.74, -1, 2)).toBe(4);
  });

  test('place와 base가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => floorTo(1, 0.5)).toThrow(RangeError);
    expect(() => floorTo(1, 1, 0)).toThrow(RangeError);
    expect(() => floorTo(1, 1, 1)).toThrow(RangeError);
    expect(() => floorTo(1, 400, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => floorTo(value, 1)).toThrow(RangeError);
    expect(() => floorTo(0, value)).toThrow(RangeError);
    expect(() => floorTo(0, 1, value)).toThrow(RangeError);
  });
});

describe('math rounding - ceilTo', () => {
  test('base 10 place 정밀도에 맞춰 올림한다', () => {
    expect(ceilTo(12.341, 2)).toBe(12.35);
    expect(ceilTo(285.714, -2)).toBe(300);
    expect(ceilTo(-12.349, 2)).toBe(-12.34);
  });

  test('custom base를 사용해 정밀도를 계산한다', () => {
    expect(ceilTo(5.26, 1, 2)).toBe(5.5);
    expect(ceilTo(5.26, -1, 2)).toBe(6);
  });

  test('place와 base가 유효하지 않으면 RangeError를 던진다', () => {
    expect(() => ceilTo(1, 0.5)).toThrow(RangeError);
    expect(() => ceilTo(1, 1, 0)).toThrow(RangeError);
    expect(() => ceilTo(1, 1, 1)).toThrow(RangeError);
    expect(() => ceilTo(1, 400, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => ceilTo(value, 1)).toThrow(RangeError);
    expect(() => ceilTo(0, value)).toThrow(RangeError);
    expect(() => ceilTo(0, 1, value)).toThrow(RangeError);
  });
});

describe('math rounding - roundAwayFromZero', () => {
  test('0에서 멀어지는 방향으로 정수 반올림한다', () => {
    expect(roundAwayFromZero(1.2)).toBe(2);
    expect(roundAwayFromZero(2)).toBe(2);
    expect(roundAwayFromZero(-1.2)).toBe(-2);
    expect(roundAwayFromZero(-2)).toBe(-2);
    expect(roundAwayFromZero(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => roundAwayFromZero(value)).toThrow(RangeError);
  });
});

describe('math fuzzy - fuzzyEqual', () => {
  test('기본 epsilon 이하 차이는 true를 반환한다', () => {
    expect(fuzzyEqual(1, 1 + 5e-10)).toBe(true);
    expect(fuzzyEqual(1, 1 + 2e-9)).toBe(false);
  });

  test('명시 epsilon 경계를 포함한다', () => {
    expect(fuzzyEqual(10, 10.5, 0.5)).toBe(true);
    expect(fuzzyEqual(10, 10.5001, 0.5)).toBe(false);
  });

  test('epsilon = 0이면 exact equality와 같다', () => {
    expect(fuzzyEqual(3, 3, 0)).toBe(true);
    expect(fuzzyEqual(3, 3 + 2 * Number.EPSILON, 0)).toBe(false);
  });

  test('음수 epsilon은 RangeError를 던진다', () => {
    expect(() => fuzzyEqual(1, 1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fuzzyEqual(value, 1)).toThrow(RangeError);
    expect(() => fuzzyEqual(1, value)).toThrow(RangeError);
    expect(() => fuzzyEqual(1, 1, value)).toThrow(RangeError);
  });
});

describe('math fuzzy - fuzzyLessThan / fuzzyGreaterThan', () => {
  test('epsilon = 0이면 strict 비교와 같다', () => {
    expect(fuzzyLessThan(1, 2, 0)).toBe(true);
    expect(fuzzyLessThan(2, 2, 0)).toBe(false);
    expect(fuzzyGreaterThan(2, 1, 0)).toBe(true);
    expect(fuzzyGreaterThan(2, 2, 0)).toBe(false);
  });

  test('epsilon 안의 값을 less enough로 허용한다', () => {
    expect(fuzzyLessThan(10.4, 10, 0.5)).toBe(true);
    expect(fuzzyLessThan(10.5, 10, 0.5)).toBe(false);
  });

  test('epsilon 안의 값을 greater enough로 허용한다', () => {
    expect(fuzzyGreaterThan(9.6, 10, 0.5)).toBe(true);
    expect(fuzzyGreaterThan(9.5, 10, 0.5)).toBe(false);
  });

  test('음수 epsilon은 RangeError를 던진다', () => {
    expect(() => fuzzyLessThan(1, 2, -1)).toThrow(RangeError);
    expect(() => fuzzyGreaterThan(2, 1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fuzzyLessThan(value, 1)).toThrow(RangeError);
    expect(() => fuzzyLessThan(1, value)).toThrow(RangeError);
    expect(() => fuzzyLessThan(1, 1, value)).toThrow(RangeError);
    expect(() => fuzzyGreaterThan(value, 1)).toThrow(RangeError);
    expect(() => fuzzyGreaterThan(1, value)).toThrow(RangeError);
    expect(() => fuzzyGreaterThan(1, 1, value)).toThrow(RangeError);
  });
});

describe('math fuzzy - fuzzyFloor / fuzzyCeil', () => {
  test('epsilon = 0이면 Math.floor와 Math.ceil과 같다', () => {
    expect(fuzzyFloor(3.9, 0)).toBe(3);
    expect(fuzzyFloor(4, 0)).toBe(4);
    expect(fuzzyCeil(3.1, 0)).toBe(4);
    expect(fuzzyCeil(4, 0)).toBe(4);
  });

  test('정수보다 epsilon 이내로 작은 값은 fuzzyFloor에서 정수로 보정된다', () => {
    expect(fuzzyFloor(3.9996, 0.001)).toBe(4);
    expect(fuzzyFloor(3.9989, 0.001)).toBe(3);
  });

  test('정수보다 epsilon 이내로 큰 값은 fuzzyCeil에서 정수로 보정된다', () => {
    expect(fuzzyCeil(4.0004, 0.001)).toBe(4);
    expect(fuzzyCeil(4.0011, 0.001)).toBe(5);
  });

  test('음수 값에서도 Math.floor(value + epsilon)과 Math.ceil(value - epsilon)을 따른다', () => {
    expect(fuzzyFloor(-2.0004, 0.001)).toBe(-2);
    expect(fuzzyFloor(-2.0011, 0.001)).toBe(-3);
    expect(fuzzyCeil(-1.9996, 0.001)).toBe(-2);
    expect(fuzzyCeil(-1.9989, 0.001)).toBe(-1);
  });

  test('음수 epsilon은 RangeError를 던진다', () => {
    expect(() => fuzzyFloor(1, -1)).toThrow(RangeError);
    expect(() => fuzzyCeil(1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fuzzyFloor(value)).toThrow(RangeError);
    expect(() => fuzzyFloor(1, value)).toThrow(RangeError);
    expect(() => fuzzyCeil(value)).toThrow(RangeError);
    expect(() => fuzzyCeil(1, value)).toThrow(RangeError);
  });
});

describe('math fuzzy - fuzzyEqualScaled', () => {
  test('절대 차이가 tolerance 이하이면 true를 반환한다', () => {
    expect(fuzzyEqualScaled(1.0, 1.0 + 1e-11)).toBe(true);
    // |diff| = 1e-7, tolerance = 1e-10 * (1 + 0.5 * 2000) ≈ 1.001e-7 → true
    expect(fuzzyEqualScaled(1000, 1000 + 1e-7)).toBe(true);
  });

  test('차이가 tolerance를 초과하면 false를 반환한다', () => {
    expect(fuzzyEqualScaled(1, 2)).toBe(false);
  });

  test('같은 값이면 항상 true를 반환한다', () => {
    expect(fuzzyEqualScaled(0, 0)).toBe(true);
    expect(fuzzyEqualScaled(-5, -5)).toBe(true);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fuzzyEqualScaled(value, 1)).toThrow(RangeError);
    expect(() => fuzzyEqualScaled(1, value)).toThrow(RangeError);
  });
});
