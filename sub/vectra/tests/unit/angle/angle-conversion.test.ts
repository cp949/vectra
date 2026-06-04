/**
 * angle domain 단위 변환과 matrix 변환 helper 호환성을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { degToRad } from '../../../src/angle/deg-to-rad';
import { degToTurn } from '../../../src/angle/deg-to-turn';
import { radToDeg } from '../../../src/angle/rad-to-deg';
import { radToTurn } from '../../../src/angle/rad-to-turn';
import { turnToDeg } from '../../../src/angle/turn-to-deg';
import { turnToRad } from '../../../src/angle/turn-to-rad';
import { degToRad as matrixDegToRad } from '../../../src/matrix/deg-to-rad';
import { radToDeg as matrixRadToDeg } from '../../../src/matrix/rad-to-deg';
import { DEG_SAMPLES, nonFiniteValues, RAD_SAMPLES } from './_fixtures/angle-fixtures';

describe('angle 변환 - degToRad', () => {
  test('180deg = πrad', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
  });

  test('90deg = π/2 rad', () => {
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('0deg = 0rad', () => {
    expect(degToRad(0)).toBe(0);
  });

  test('-180deg = -πrad', () => {
    expect(degToRad(-180)).toBeCloseTo(-Math.PI, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => degToRad(value)).toThrow(RangeError);
  });
});

describe('angle 변환 - radToDeg', () => {
  test('πrad = 180deg', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180, 10);
  });

  test('π/2 rad = 90deg', () => {
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 10);
  });

  test('0rad = 0deg', () => {
    expect(radToDeg(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => radToDeg(value)).toThrow(RangeError);
  });
});

describe('angle 변환 - turnToRad', () => {
  test('0.5turn = πrad', () => {
    expect(turnToRad(0.5)).toBeCloseTo(Math.PI, 10);
  });

  test('1turn = 2πrad', () => {
    expect(turnToRad(1)).toBeCloseTo(2 * Math.PI, 10);
  });

  test('0turn = 0rad', () => {
    expect(turnToRad(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => turnToRad(value)).toThrow(RangeError);
  });
});

describe('angle 변환 - radToTurn', () => {
  test('πrad = 0.5turn', () => {
    expect(radToTurn(Math.PI)).toBeCloseTo(0.5, 10);
  });

  test('2πrad = 1turn', () => {
    expect(radToTurn(2 * Math.PI)).toBeCloseTo(1, 10);
  });

  test('0rad = 0turn', () => {
    expect(radToTurn(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => radToTurn(value)).toThrow(RangeError);
  });
});

describe('angle 변환 - turnToDeg', () => {
  test('0.5turn = 180deg', () => {
    expect(turnToDeg(0.5)).toBe(180);
  });

  test('1turn = 360deg', () => {
    expect(turnToDeg(1)).toBe(360);
  });

  test('0turn = 0deg', () => {
    expect(turnToDeg(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => turnToDeg(value)).toThrow(RangeError);
  });
});

describe('angle 변환 - degToTurn', () => {
  test('180deg = 0.5turn', () => {
    expect(degToTurn(180)).toBe(0.5);
  });

  test('360deg = 1turn', () => {
    expect(degToTurn(360)).toBe(1);
  });

  test('0deg = 0turn', () => {
    expect(degToTurn(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => degToTurn(value)).toThrow(RangeError);
  });
});

describe('angle 변환 round-trip', () => {
  test.each(DEG_SAMPLES)('degToRad → radToDeg round-trip: %sdeg', (deg) => {
    expect(radToDeg(degToRad(deg))).toBeCloseTo(deg, 10);
  });

  test.each(RAD_SAMPLES)('radToDeg → degToRad round-trip: %srad', (rad) => {
    expect(degToRad(radToDeg(rad))).toBeCloseTo(rad, 10);
  });

  test('turnToRad → radToTurn round-trip: 0.25turn', () => {
    expect(radToTurn(turnToRad(0.25))).toBeCloseTo(0.25, 10);
  });

  test('degToTurn → turnToDeg round-trip: 90deg', () => {
    expect(turnToDeg(degToTurn(90))).toBeCloseTo(90, 10);
  });
});

describe('matrix 호환성 - degToRad/radToDeg 결과 일치', () => {
  test.each(DEG_SAMPLES)('angle.degToRad(%sdeg) === matrix.degToRad(%sdeg)', (deg) => {
    // angle.degToRad는 non-finite 체크가 추가되지만 finite 입력에서는 동일한 결과여야 한다
    expect(degToRad(deg)).toBe(matrixDegToRad(deg));
  });

  test.each(RAD_SAMPLES)('angle.radToDeg(%srad) === matrix.radToDeg(%srad)', (rad) => {
    expect(radToDeg(rad)).toBe(matrixRadToDeg(rad));
  });
});
