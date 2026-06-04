import { describe, expect, test } from 'vitest';
import { abs } from '../../../src/math/abs';
import { copySign } from '../../../src/math/copy-sign';
import { floorDiv } from '../../../src/math/floor-div';
import { fract } from '../../../src/math/fract';
import { gcd } from '../../../src/math/gcd';
import { isNegativeZero } from '../../../src/math/is-negative-zero';
import { isPositiveZero } from '../../../src/math/is-positive-zero';
import { isPowerOfTwo } from '../../../src/math/is-power-of-two';
import { isSameSign } from '../../../src/math/is-same-sign';
import { lcm } from '../../../src/math/lcm';
import { nextPowerOfTwo } from '../../../src/math/next-power-of-two';
import { prevPowerOfTwo } from '../../../src/math/prev-power-of-two';
import { sign } from '../../../src/math/sign';
import { solveCubic } from '../../../src/math/solve-cubic';
import { solveLinear } from '../../../src/math/solve-linear';
import { solveQuadratic } from '../../../src/math/solve-quadratic';
import { toFixedPrecision } from '../../../src/math/to-fixed-precision';
import { trunc } from '../../../src/math/trunc';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('math scalar - sign', () => {
  test('양수는 1, 음수는 -1, 0은 0을 반환한다', () => {
    expect(sign(5)).toBe(1);
    expect(sign(-3)).toBe(-1);
    expect(sign(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => sign(value)).toThrow(RangeError);
  });
});

describe('math scalar - abs', () => {
  test('음수의 절댓값을 반환한다', () => {
    expect(abs(-5)).toBe(5);
    expect(abs(3)).toBe(3);
    expect(abs(0)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => abs(value)).toThrow(RangeError);
  });
});

describe('math scalar - copySign', () => {
  test('양수 magnitude에 음수 signSource를 적용하면 음수를 반환한다', () => {
    expect(copySign(5, -1)).toBe(-5);
  });

  test('음수 magnitude에 양수 signSource를 적용하면 양수를 반환한다', () => {
    expect(copySign(-5, 1)).toBe(5);
  });

  test('signSource가 -0이면 음수 sign을 적용한다', () => {
    expect(copySign(5, -0)).toBe(-5);
  });

  test('signSource가 +0이면 양수 sign을 적용한다', () => {
    expect(copySign(-5, 0)).toBe(5);
  });

  test('zero magnitude에 음수 signSource를 적용하면 -0을 반환한다', () => {
    expect(Object.is(copySign(0, -1), -0)).toBe(true);
  });

  test('zero magnitude에 양수 signSource를 적용하면 +0을 반환한다', () => {
    expect(Object.is(copySign(0, 1), 0)).toBe(true);
  });

  test('-0 magnitude도 signSource 부호를 따른다', () => {
    expect(Object.is(copySign(-0, 1), 0)).toBe(true);
    expect(Object.is(copySign(-0, -1), -0)).toBe(true);
  });

  test.each(nonFiniteValues)('finite하지 않은 magnitude %s는 RangeError를 던진다', (value) => {
    expect(() => copySign(value, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 signSource %s는 RangeError를 던진다', (value) => {
    expect(() => copySign(1, value)).toThrow(RangeError);
  });
});

describe('math scalar - isPositiveZero', () => {
  test('+0이면 true를 반환한다', () => {
    expect(isPositiveZero(0)).toBe(true);
  });

  test('-0이면 false를 반환한다', () => {
    expect(isPositiveZero(-0)).toBe(false);
  });

  test('non-zero finite number는 false를 반환한다', () => {
    expect(isPositiveZero(1)).toBe(false);
    expect(isPositiveZero(-1)).toBe(false);
    expect(isPositiveZero(0.5)).toBe(false);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isPositiveZero(value)).toThrow(RangeError);
  });
});

describe('math scalar - isNegativeZero', () => {
  test('-0이면 true를 반환한다', () => {
    expect(isNegativeZero(-0)).toBe(true);
  });

  test('+0이면 false를 반환한다', () => {
    expect(isNegativeZero(0)).toBe(false);
  });

  test('non-zero finite number는 false를 반환한다', () => {
    expect(isNegativeZero(1)).toBe(false);
    expect(isNegativeZero(-1)).toBe(false);
    expect(isNegativeZero(-0.5)).toBe(false);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isNegativeZero(value)).toThrow(RangeError);
  });
});

describe('math scalar - isSameSign', () => {
  test('같은 부호의 양수쌍은 true를 반환한다', () => {
    expect(isSameSign(3, 7)).toBe(true);
  });

  test('같은 부호의 음수쌍은 true를 반환한다', () => {
    expect(isSameSign(-3, -7)).toBe(true);
  });

  test('+0과 양수는 같은 sign이다', () => {
    expect(isSameSign(0, 1)).toBe(true);
    expect(isSameSign(1, 0)).toBe(true);
  });

  test('-0과 음수는 같은 sign이다', () => {
    expect(isSameSign(-0, -1)).toBe(true);
    expect(isSameSign(-1, -0)).toBe(true);
  });

  test('+0과 -0은 다른 sign이다', () => {
    expect(isSameSign(0, -0)).toBe(false);
    expect(isSameSign(-0, 0)).toBe(false);
  });

  test('+0과 음수는 다른 sign이다', () => {
    expect(isSameSign(0, -1)).toBe(false);
  });

  test('-0과 양수는 다른 sign이다', () => {
    expect(isSameSign(-0, 1)).toBe(false);
  });

  test('양수와 음수는 다른 sign이다', () => {
    expect(isSameSign(1, -1)).toBe(false);
  });

  test.each(nonFiniteValues)('finite하지 않은 첫 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isSameSign(value, 1)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('finite하지 않은 둘째 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => isSameSign(1, value)).toThrow(RangeError);
  });
});

describe('math scalar - fract', () => {
  test('소수 부분을 반환한다', () => {
    expect(fract(3.7)).toBeCloseTo(0.7);
    expect(fract(-3.7)).toBeCloseTo(-0.7);
    expect(fract(5)).toBe(0);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => fract(value)).toThrow(RangeError);
  });
});

describe('math scalar - trunc', () => {
  test('소수 부분을 제거해 정수 부분을 반환한다', () => {
    expect(trunc(3.7)).toBe(3);
    expect(trunc(-3.7)).toBe(-3);
    expect(trunc(5)).toBe(5);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => trunc(value)).toThrow(RangeError);
  });
});

describe('math integer - isPowerOfTwo', () => {
  test('2의 거듭제곱이면 true를 반환한다', () => {
    expect(isPowerOfTwo(1)).toBe(true);
    expect(isPowerOfTwo(2)).toBe(true);
    expect(isPowerOfTwo(4)).toBe(true);
    expect(isPowerOfTwo(1024)).toBe(true);
  });

  test('2의 거듭제곱이 아니면 false를 반환한다', () => {
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(0)).toBe(false);
    expect(isPowerOfTwo(-2)).toBe(false);
    expect(isPowerOfTwo(1.5)).toBe(false);
  });

  test('32-bit 비트 트릭 한계를 넘는 큰 safe integer 2의 거듭제곱도 인식한다', () => {
    expect(isPowerOfTwo(2 ** 32)).toBe(true);
    expect(isPowerOfTwo(2 ** 40)).toBe(true);
    expect(isPowerOfTwo(2 ** 52)).toBe(true);
  });

  test('32-bit 한계를 넘는 비-2의 거듭제곱은 false를 반환한다', () => {
    // 비트 트릭이 int32 강제 변환으로 잘못 true를 내던 회귀를 막는다.
    expect(isPowerOfTwo(2 ** 32 + 1)).toBe(false);
    expect(isPowerOfTwo(3 * 2 ** 30)).toBe(false);
    expect(isPowerOfTwo(Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});

describe('math integer - nextPowerOfTwo', () => {
  test('이미 2의 거듭제곱이면 그 값을 반환한다', () => {
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(4)).toBe(4);
    expect(nextPowerOfTwo(8)).toBe(8);
  });

  test('2의 거듭제곱이 아니면 다음 2의 거듭제곱을 반환한다', () => {
    expect(nextPowerOfTwo(3)).toBe(4);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(100)).toBe(128);
  });

  test('1 미만 또는 비정수이면 RangeError를 던진다', () => {
    expect(() => nextPowerOfTwo(0)).toThrow(RangeError);
    expect(() => nextPowerOfTwo(-1)).toThrow(RangeError);
    expect(() => nextPowerOfTwo(1.5)).toThrow(RangeError);
  });

  test('2^32 이상 큰 값에서도 올바른 다음 2의 거듭제곱을 반환한다', () => {
    expect(nextPowerOfTwo(2 ** 32 + 1)).toBe(2 ** 33);
    expect(nextPowerOfTwo(2 ** 33)).toBe(2 ** 33);
    expect(nextPowerOfTwo(2 ** 52)).toBe(2 ** 52);
  });

  test('2^52 초과이면 RangeError를 던진다', () => {
    expect(() => nextPowerOfTwo(2 ** 52 + 1)).toThrow(RangeError);
  });
});

describe('math integer - prevPowerOfTwo', () => {
  test('이미 2의 거듭제곱이면 그 값을 반환한다', () => {
    expect(prevPowerOfTwo(1)).toBe(1);
    expect(prevPowerOfTwo(4)).toBe(4);
    expect(prevPowerOfTwo(8)).toBe(8);
  });

  test('2의 거듭제곱이 아니면 이전 2의 거듭제곱을 반환한다', () => {
    expect(prevPowerOfTwo(3)).toBe(2);
    expect(prevPowerOfTwo(5)).toBe(4);
    expect(prevPowerOfTwo(100)).toBe(64);
  });

  test('1 미만 또는 비정수이면 RangeError를 던진다', () => {
    expect(() => prevPowerOfTwo(0)).toThrow(RangeError);
    expect(() => prevPowerOfTwo(-1)).toThrow(RangeError);
    expect(() => prevPowerOfTwo(1.5)).toThrow(RangeError);
  });

  test('2^32 이상 큰 값에서도 올바른 이전 2의 거듭제곱을 반환한다', () => {
    expect(prevPowerOfTwo(2 ** 32 + 1)).toBe(2 ** 32);
    expect(prevPowerOfTwo(2 ** 33)).toBe(2 ** 33);
    expect(prevPowerOfTwo(2 ** 52)).toBe(2 ** 52);
  });
});

describe('math integer - gcd', () => {
  test('두 정수의 최대공약수를 반환한다', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 3)).toBe(1);
    expect(gcd(100, 25)).toBe(25);
  });

  test('음수 입력에도 양수 gcd를 반환한다', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });

  test('0이 포함되면 |a| 또는 |b|를 반환한다', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
    expect(gcd(0, 0)).toBe(0);
  });

  test('비정수이면 RangeError를 던진다', () => {
    expect(() => gcd(1.5, 2)).toThrow(RangeError);
    expect(() => gcd(4, 1.5)).toThrow(RangeError);
  });
});

describe('math integer - lcm', () => {
  test('두 정수의 최소공배수를 반환한다', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(7, 3)).toBe(21);
    expect(lcm(12, 4)).toBe(12);
  });

  test('0이 포함되면 0을 반환한다', () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(7, 0)).toBe(0);
  });

  test('비정수이면 RangeError를 던진다', () => {
    expect(() => lcm(1.5, 2)).toThrow(RangeError);
  });
});

describe('math integer - floorDiv', () => {
  test('floor division semantics를 따른다', () => {
    expect(floorDiv(7, 3)).toBe(2);
    expect(floorDiv(-7, 3)).toBe(-3);
    expect(floorDiv(7, -3)).toBe(-3);
    expect(floorDiv(-7, -3)).toBe(2);
  });

  test('non-integer 입력도 floor 결과를 반환한다', () => {
    expect(floorDiv(7.5, 2)).toBe(3);
  });

  test('b === 0이면 RangeError를 던진다', () => {
    expect(() => floorDiv(1, 0)).toThrow(RangeError);
  });

  test('나눗셈 결과가 overflow로 non-finite이면 RangeError를 던진다', () => {
    expect(() => floorDiv(Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });

  test('결과 -0은 0으로 정규화한다', () => {
    expect(Object.is(floorDiv(0, -5), 0)).toBe(true);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => floorDiv(value, 3)).toThrow(RangeError);
    expect(() => floorDiv(7, value)).toThrow(RangeError);
  });
});

describe('math precision - toFixedPrecision', () => {
  test('기본값 6자리로 반올림한다', () => {
    expect(toFixedPrecision(1.123456789)).toBe(1.123457);
  });

  test('number 인자로 자릿수를 지정한다', () => {
    expect(toFixedPrecision(Math.PI, 2)).toBe(3.14);
    expect(toFixedPrecision(1.5, 0)).toBe(2);
  });

  test('options object로 자릿수를 지정한다', () => {
    expect(toFixedPrecision(Math.PI, { digits: 3 })).toBe(Math.round(Math.PI * 1000) / 1000);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => toFixedPrecision(value)).toThrow(RangeError);
  });
});

describe('math solver - solveLinear', () => {
  test('ax + b = 0의 해를 반환한다', () => {
    expect(solveLinear(2, -4)).toBe(2);
    expect(solveLinear(1, 3)).toBe(-3);
  });

  test('a === 0이면 NaN을 반환한다', () => {
    expect(solveLinear(0, 5)).toBeNaN();
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => solveLinear(value, 1)).toThrow(RangeError);
    expect(() => solveLinear(1, value)).toThrow(RangeError);
  });
});

describe('math solver - solveQuadratic', () => {
  test('두 개의 실수 근을 정렬해 반환한다', () => {
    const roots = solveQuadratic(1, -5, 6);
    expect(roots).toHaveLength(2);
    expect(roots[0]).toBeCloseTo(2);
    expect(roots[1]).toBeCloseTo(3);
  });

  test('판별식이 0이면 중복근을 단일 원소로 반환한다', () => {
    const roots = solveQuadratic(1, -2, 1);
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(1);
  });

  test('판별식이 음수이면 빈 배열을 반환한다', () => {
    expect(solveQuadratic(1, 0, 1)).toHaveLength(0);
  });

  test('a === 0이면 선형 fallback을 사용한다', () => {
    const roots = solveQuadratic(0, 2, -4);
    expect(roots).toHaveLength(1);
    expect(roots[0]).toBeCloseTo(2);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => solveQuadratic(value, 0, 0)).toThrow(RangeError);
  });
});

describe('math solver - solveCubic', () => {
  test('세 개의 실수 근을 정렬해 반환한다', () => {
    // (x-1)(x-2)(x-3) = x³ - 6x² + 11x - 6
    const roots = solveCubic(1, -6, 11, -6);
    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(1);
    expect(roots[1]).toBeCloseTo(2);
    expect(roots[2]).toBeCloseTo(3);
  });

  test('discriminant 절대값이 작아도 서로 다른 세 실수 근을 유지한다', () => {
    // x³ - 0.001x = x(x² - 0.001)
    const root = Math.sqrt(0.001);
    const roots = solveCubic(1, 0, -0.001, 0);

    expect(roots).toHaveLength(3);
    expect(roots[0]).toBeCloseTo(-root);
    expect(roots[1]).toBeCloseTo(0);
    expect(roots[2]).toBeCloseTo(root);
  });

  test('실수 근이 1개인 경우를 처리한다', () => {
    // x³ + x + 1 = 0 → 실수 근 1개
    const roots = solveCubic(1, 0, 1, 1);
    expect(roots).toHaveLength(1);
  });

  test('a === 0이면 2차 방정식으로 fallback한다', () => {
    const roots = solveCubic(0, 1, -5, 6);
    expect(roots).toHaveLength(2);
    expect(roots[0]).toBeCloseTo(2);
    expect(roots[1]).toBeCloseTo(3);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => solveCubic(value, 0, 0, 0)).toThrow(RangeError);
  });
});
