/**
 * calculus 방어 분기 경계 테스트.
 *
 * grid 간격 underflow(`dx === 0`), 간격 역수·제곱 overflow, 적분 결과와 누적합 overflow,
 * 미분 항목 overflow, 지원 밖 `step` 타입, 결과 matrix의 `-0` 정리를 한 곳에서 확인한다.
 * 각 테스트는 에러 메시지로 어느 분기가 던졌는지까지 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { cumulativeTrapezoidInto } from '../../../src/calculus/cumulative-trapezoid-into';
import { derivativeInto } from '../../../src/calculus/derivative-into';
import { gradient } from '../../../src/calculus/gradient';
import { commitMatrixInto } from '../../../src/calculus/multivariate-validate.internal';
import { secondDerivativeInto } from '../../../src/calculus/second-derivative-into';
import { simpsonIntegral } from '../../../src/calculus/simpson-integral';
import { trapezoidalIntegral } from '../../../src/calculus/trapezoidal-integral';

/** 가장 작은 양의 subnormal. 2로 나누면 round-to-even으로 0이 된다. */
const MIN = Number.MIN_VALUE;

/** 간격 검증에서 던지는 케이스에 쓰는 단순한 f. 던지기 전에는 호출되지 않는다. */
const identity = (x: number): number => x;

describe('derivativeInto — 간격 검증', () => {
  test('간격이 underflow로 0이 되면 RangeError를 던지고 out을 바꾸지 않는다', () => {
    const out = [9];
    expect(() => derivativeInto(out, identity, 0, MIN, 3)).toThrow(/spacing must be a finite non-zero/);
    expect(out).toEqual([9]);
  });

  test('간격 역수가 overflow하면 RangeError를 던지고 out을 바꾸지 않는다', () => {
    const out = [9];
    expect(() => derivativeInto(out, identity, 0, MIN, 2)).toThrow(/scale \(1 \/ spacing\) must be finite/);
    expect(out).toEqual([9]);
  });
});

describe('secondDerivativeInto — 간격·항목 검증', () => {
  test('간격이 underflow로 0이 되면 RangeError를 던진다', () => {
    expect(() => secondDerivativeInto([], identity, 0, MIN, 3)).toThrow(/spacing must be a finite non-zero/);
  });

  test('간격의 제곱이 underflow로 0이 되면 RangeError를 던진다', () => {
    expect(() => secondDerivativeInto([], identity, 0, 1e-170, 3)).toThrow(/spacing squared must be finite non-zero/);
  });

  test('간격의 제곱이 overflow하면 RangeError를 던진다', () => {
    expect(() => secondDerivativeInto([], identity, 0, 1e155, 3)).toThrow(/spacing squared must be finite non-zero/);
  });

  test('간격 제곱의 역수가 overflow하면 RangeError를 던진다', () => {
    expect(() => secondDerivativeInto([], identity, 0, 1e-160, 3)).toThrow(/scale \(1 \/ dx\^2\) must be finite/);
  });

  test('분자는 유한해도 역수를 곱한 항목이 overflow하면 RangeError를 던진다', () => {
    // 분자 2e305, 1 / dx^2 = 4e6이라 항목은 8e311이다.
    const f = (x: number): number => (x > 0 && x < 1e-3 ? 0 : 1e305);
    expect(() => secondDerivativeInto([], f, 0, 1e-3, 3)).toThrow(/entry at index 0 must be finite/);
  });
});

describe('simpsonIntegral — 간격·결과 검증', () => {
  test('간격이 underflow로 0이 되면 RangeError를 던진다', () => {
    expect(() => simpsonIntegral(identity, 0, MIN, 3)).toThrow(/spacing must be a finite non-zero/);
  });

  test('부분합은 유한해도 간격을 곱한 결과가 overflow하면 RangeError를 던진다', () => {
    expect(() => simpsonIntegral(() => 1e300, 0, 1e10, 3)).toThrow(/Simpson integral result must be finite/);
  });
});

describe('trapezoidalIntegral — 간격·결과 검증', () => {
  test('간격이 underflow로 0이 되면 RangeError를 던진다', () => {
    expect(() => trapezoidalIntegral(identity, 0, MIN, 3)).toThrow(/spacing must be a finite non-zero/);
  });

  test('부분합은 유한해도 간격을 곱한 결과가 overflow하면 RangeError를 던진다', () => {
    expect(() => trapezoidalIntegral(() => 1e300, 0, 1e10, 3)).toThrow(/trapezoidal integral result must be finite/);
  });
});

describe('cumulativeTrapezoidInto — 누적합 검증', () => {
  test('증분은 유한해도 누적합이 overflow하면 RangeError를 던지고 out을 바꾸지 않는다', () => {
    // 증분은 MAX / 2씩이라 index 2에서 MAX, index 3에서 Infinity가 된다.
    const half = Number.MAX_VALUE / 2;
    const out = [9];
    expect(() => cumulativeTrapezoidInto(out, [half, half, half, half])).toThrow(
      /cumulative trapezoid partial sum at index 3 must be finite/
    );
    expect(out).toEqual([9]);
  });
});

describe('multivariate 보조 함수', () => {
  test('step이 숫자도 배열도 아니면 RangeError를 던진다', () => {
    // JS 호출자가 잘못된 타입을 넘기는 경우의 보호다.
    expect(() => gradient(() => 0, [1], { step: 'a' as never })).toThrow(
      /step must be a positive finite number or a readonly number\[\] of length 1, got string/
    );
  });

  test('commitMatrixInto는 -0 entry를 +0으로 정리한다', () => {
    const out: number[][] = [];
    commitMatrixInto(out, [[-0, 1]]);
    expect(Object.is(out[0]?.[0], 0)).toBe(true);
    expect(out[0]?.[1]).toBe(1);
  });
});
