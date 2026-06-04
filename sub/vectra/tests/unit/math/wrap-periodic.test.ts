import { describe, expect, test } from 'vitest';
import { cycle } from '../../../src/math/cycle';
import { pingPong } from '../../../src/math/ping-pong';
import { sawtoothWave } from '../../../src/math/sawtooth-wave';
import { squareWave } from '../../../src/math/square-wave';
import { triangleWave } from '../../../src/math/triangle-wave';
import { wrapFloatHalfOpen } from '../../../src/math/wrap-float-half-open';
import { wrapIntHalfOpen } from '../../../src/math/wrap-int-half-open';
import { wrapIntInclusive } from '../../../src/math/wrap-int-inclusive';
import { wrapRange } from '../../../src/math/wrap-range';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('math wrap - wrapFloatHalfOpen', () => {
  test('값을 half-open range 안으로 감싼다', () => {
    expect(wrapFloatHalfOpen(10, 0, 10)).toBe(0);
    expect(wrapFloatHalfOpen(10.25, 0, 10)).toBe(0.25);
    expect(wrapFloatHalfOpen(-0.25, 0, 10)).toBe(9.75);
    expect(wrapFloatHalfOpen(25, 10, 20)).toBe(15);
  });

  test('min보다 작은 음수 나머지를 보정한다', () => {
    expect(wrapFloatHalfOpen(-21.5, -10, 10)).toBe(-1.5);
  });

  test('뒤집힌 range와 0-length range는 RangeError를 던진다', () => {
    expect(() => wrapFloatHalfOpen(0, 10, 0)).toThrow(RangeError);
    expect(() => wrapFloatHalfOpen(0, 10, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapFloatHalfOpen(value, 0, 1)).toThrow(RangeError);
    expect(() => wrapFloatHalfOpen(0, value, 1)).toThrow(RangeError);
    expect(() => wrapFloatHalfOpen(0, 0, value)).toThrow(RangeError);
  });
});

describe('math wrap - wrapIntHalfOpen', () => {
  test('정수 값을 half-open range 안으로 감싼다', () => {
    expect(wrapIntHalfOpen(10, 0, 10)).toBe(0);
    expect(wrapIntHalfOpen(-1, 0, 10)).toBe(9);
    expect(wrapIntHalfOpen(25, 10, 20)).toBe(15);
  });

  test('뒤집힌 range와 0-length range는 RangeError를 던진다', () => {
    expect(() => wrapIntHalfOpen(0, 10, 0)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, 10, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 정수 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapIntHalfOpen(value, 0, 1)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, value, 1)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, 0, value)).toThrow(RangeError);
  });

  test('정수가 아니거나 safe integer가 아닌 인자는 RangeError를 던진다', () => {
    expect(() => wrapIntHalfOpen(0.5, 0, 10)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, 0.5, 10)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, 0, 10.5)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(Number.MAX_SAFE_INTEGER + 1, 0, 10)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, Number.MIN_SAFE_INTEGER - 1, 0)).toThrow(RangeError);
    expect(() => wrapIntHalfOpen(0, 0, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  test('modulo span이 safe integer 범위를 넘으면 RangeError를 던진다', () => {
    expect(() =>
      wrapIntHalfOpen(Number.MAX_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    ).toThrow(RangeError);
  });

  test('value와 min의 차이가 safe integer 범위를 넘으면 RangeError를 던진다', () => {
    expect(() => wrapIntHalfOpen(Number.MIN_SAFE_INTEGER, 100, 110)).toThrow(RangeError);
  });
});

describe('math wrap - wrapIntInclusive', () => {
  test('정수 값을 closed range 안으로 감싼다', () => {
    expect(wrapIntInclusive(10, 0, 10)).toBe(10);
    expect(wrapIntInclusive(11, 0, 10)).toBe(0);
    expect(wrapIntInclusive(-1, 0, 10)).toBe(10);
    expect(wrapIntInclusive(25, 10, 20)).toBe(14);
  });

  test('0-length range는 유효하며 min을 반환한다', () => {
    expect(wrapIntInclusive(0, 0, 0)).toBe(0);
    expect(wrapIntInclusive(5, 3, 3)).toBe(3);
  });

  test('뒤집힌 range는 RangeError를 던진다', () => {
    expect(() => wrapIntInclusive(0, 10, 0)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 정수 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapIntInclusive(value, 0, 1)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, value, 1)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, 0, value)).toThrow(RangeError);
  });

  test('정수가 아니거나 safe integer가 아닌 인자는 RangeError를 던진다', () => {
    expect(() => wrapIntInclusive(0.5, 0, 10)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, 0.5, 10)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, 0, 10.5)).toThrow(RangeError);
    expect(() => wrapIntInclusive(Number.MAX_SAFE_INTEGER + 1, 0, 10)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, Number.MIN_SAFE_INTEGER - 1, 0)).toThrow(RangeError);
    expect(() => wrapIntInclusive(0, 0, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  test('inclusive modulo span이 safe integer 범위를 넘으면 RangeError를 던진다', () => {
    expect(() =>
      wrapIntInclusive(Number.MAX_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    ).toThrow(RangeError);
  });

  test('value와 min의 차이가 safe integer 범위를 넘으면 RangeError를 던진다', () => {
    expect(() => wrapIntInclusive(Number.MIN_SAFE_INTEGER, 100, 110)).toThrow(RangeError);
  });
});

describe('math periodic - cycle', () => {
  test('값을 [0, length) 범위로 wrap한다', () => {
    expect(cycle(0, 5)).toBe(0);
    expect(cycle(5, 5)).toBe(0);
    expect(cycle(7, 5)).toBe(2);
    expect(cycle(2.5, 5)).toBe(2.5);
  });

  test('음수 t를 양수 phase로 보정한다', () => {
    expect(cycle(-1, 5)).toBe(4);
    expect(cycle(-6.5, 5)).toBe(3.5);
  });

  test('결과의 -0은 0으로 정규화한다', () => {
    const result = cycle(-0, 5);
    expect(Object.is(result, -0)).toBe(false);
    expect(result).toBe(0);
  });

  test('length가 양수가 아니면 RangeError를 던진다', () => {
    expect(() => cycle(1, 0)).toThrow(RangeError);
    expect(() => cycle(1, -1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => cycle(value, 5)).toThrow(RangeError);
    expect(() => cycle(0, value)).toThrow(RangeError);
  });
});

describe('math periodic - pingPong', () => {
  test('boundary에서 0, length, 0 순서로 반복한다', () => {
    expect(pingPong(0, 5)).toBe(0);
    expect(pingPong(5, 5)).toBe(5);
    expect(pingPong(10, 5)).toBe(0);
  });

  test('내부 구간에서 fold 결과를 반환한다', () => {
    expect(pingPong(3, 5)).toBe(3);
    expect(pingPong(7, 5)).toBe(3);
    expect(pingPong(-1, 5)).toBe(1);
  });

  test('length가 양수가 아니면 RangeError를 던진다', () => {
    expect(() => pingPong(1, 0)).toThrow(RangeError);
    expect(() => pingPong(1, -1)).toThrow(RangeError);
  });

  test('2 * length가 finite가 아니면 RangeError를 던진다', () => {
    expect(() => pingPong(0, Number.MAX_VALUE)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => pingPong(value, 5)).toThrow(RangeError);
    expect(() => pingPong(0, value)).toThrow(RangeError);
  });
});

describe('math periodic - wrapRange', () => {
  test('값을 [min, max) 범위로 wrap한다', () => {
    expect(wrapRange(10, 0, 10)).toBe(0);
    expect(wrapRange(10.25, 0, 10)).toBe(0.25);
    expect(wrapRange(-0.25, 0, 10)).toBe(9.75);
    expect(wrapRange(25, 10, 20)).toBe(15);
  });

  test('wrapFloatHalfOpen과 같은 결과를 반환한다', () => {
    const samples = [-21.5, -1, 0, 0.5, 7.25, 10, 15, 100];
    for (const value of samples) {
      expect(wrapRange(value, -10, 10)).toBe(wrapFloatHalfOpen(value, -10, 10));
    }
  });

  test('뒤집힌 range와 0-length range는 RangeError를 던진다', () => {
    expect(() => wrapRange(0, 10, 0)).toThrow(RangeError);
    expect(() => wrapRange(0, 10, 10)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => wrapRange(value, 0, 1)).toThrow(RangeError);
    expect(() => wrapRange(0, value, 1)).toThrow(RangeError);
    expect(() => wrapRange(0, 0, value)).toThrow(RangeError);
  });
});

describe('math periodic - sawtoothWave', () => {
  test('주기 1로 [0, 1) phase를 반환한다', () => {
    expect(sawtoothWave(0)).toBe(0);
    expect(sawtoothWave(0.25)).toBe(0.25);
    expect(sawtoothWave(1)).toBe(0);
    expect(sawtoothWave(2.5)).toBe(0.5);
  });

  test('음수 t는 양수 phase로 보정한다', () => {
    expect(sawtoothWave(-0.25)).toBe(0.75);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sawtoothWave(value)).toThrow(RangeError);
  });
});

describe('math periodic - squareWave', () => {
  test('주기 1의 first half는 1, second half는 0을 반환한다', () => {
    expect(squareWave(0)).toBe(1);
    expect(squareWave(0.25)).toBe(1);
    expect(squareWave(0.499)).toBe(1);
    expect(squareWave(0.5)).toBe(0);
    expect(squareWave(0.75)).toBe(0);
    expect(squareWave(1)).toBe(1);
  });

  test('음수 t도 같은 주기 규칙을 따른다', () => {
    expect(squareWave(-0.25)).toBe(0);
    expect(squareWave(-0.75)).toBe(1);
  });

  test('반환 타입은 0 | 1이다', () => {
    const result: 0 | 1 = squareWave(0.3);
    expect(result).toBe(1);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => squareWave(value)).toThrow(RangeError);
  });
});

describe('math periodic - triangleWave', () => {
  test('주기 1의 boundary에서 0과 1을 반환한다', () => {
    expect(triangleWave(0)).toBe(0);
    expect(triangleWave(0.5)).toBe(1);
    expect(triangleWave(1)).toBe(0);
  });

  test('내부 phase에서 선형 보간된 [0, 1] 값을 반환한다', () => {
    expect(triangleWave(0.25)).toBeCloseTo(0.5);
    expect(triangleWave(0.75)).toBeCloseTo(0.5);
  });

  test('음수 t도 양수 phase 규칙을 따른다', () => {
    expect(triangleWave(-0.25)).toBeCloseTo(0.5);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => triangleWave(value)).toThrow(RangeError);
  });
});
