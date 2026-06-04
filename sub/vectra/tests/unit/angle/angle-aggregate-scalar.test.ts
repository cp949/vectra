/**
 * angle domain 평균, 이등분, clamp, 보각, 여각 helper를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { averageAngle } from '../../../src/angle/average-angle';
import { bisectAngle } from '../../../src/angle/bisect-angle';
import { clampAngle } from '../../../src/angle/clamp-angle';
import { complement } from '../../../src/angle/complement';
import { supplement } from '../../../src/angle/supplement';
import { nonFiniteValues } from './_fixtures/angle-fixtures';

describe('averageAngle - 원형 평균 방향', () => {
  test('empty array는 RangeError를 던진다', () => {
    expect(() => averageAngle([])).toThrow(RangeError);
  });

  test('단일 원소는 해당 angle을 반환한다', () => {
    expect(averageAngle([Math.PI / 3])).toBeCloseTo(Math.PI / 3, 10);
  });

  test('[0, π/2] → π/4이다 (vector mean)', () => {
    // sin 합 = 0+1 = 1, cos 합 = 1+0 = 1, atan2(1,1) = π/4
    expect(averageAngle([0, Math.PI / 2])).toBeCloseTo(Math.PI / 4, 10);
  });

  test('wrap-around 대칭 쌍 [-π/4, π/4] → 0이다', () => {
    // sin 합 = 0, cos 합 = 2cos(π/4) > 0, atan2(0, positive) = 0
    expect(averageAngle([-Math.PI / 4, Math.PI / 4])).toBeCloseTo(0, 10);
  });

  test('완전 상쇄 쌍 [π/2, -π/2] → 0이다 ((0,0) fallback)', () => {
    // sin(π/2)+sin(-π/2) = 0, cos(π/2)+cos(-π/2) = 0, atan2(0,0) = 0
    expect(averageAngle([Math.PI / 2, -Math.PI / 2])).toBe(0);
  });

  test('같은 angle 여러 개는 해당 angle을 반환한다', () => {
    expect(averageAngle([Math.PI / 6, Math.PI / 6, Math.PI / 6])).toBeCloseTo(Math.PI / 6, 10);
  });

  test.each(nonFiniteValues)('non-finite 원소 %s는 RangeError를 던진다', (value) => {
    expect(() => averageAngle([0, value])).toThrow(RangeError);
  });
});

describe('bisectAngle - 최단 circular midpoint', () => {
  test('0에서 π/2의 midpoint는 π/4이다', () => {
    expect(bisectAngle(0, Math.PI / 2)).toBeCloseTo(Math.PI / 4, 10);
  });

  test('π/4에서 3π/4의 midpoint는 π/2이다', () => {
    expect(bisectAngle(Math.PI / 4, (3 * Math.PI) / 4)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('wrap-around: 5π/6에서 -5π/6의 midpoint는 π이다', () => {
    // angleDelta(5π/6, -5π/6) = wrapRadians(-5π/3) = π/3. midpoint = 5π/6 + π/6 = π
    expect(bisectAngle((5 * Math.PI) / 6, (-5 * Math.PI) / 6)).toBeCloseTo(Math.PI, 10);
  });

  test('antipodal tie: 0에서 π의 midpoint는 -π/2이다 (negative direction)', () => {
    // angleDelta(0, π) = wrapRadians(π) = -π. midpoint = 0 + (-π)/2 = -π/2
    expect(bisectAngle(0, Math.PI)).toBeCloseTo(-Math.PI / 2, 10);
  });

  test('a === b이면 a를 반환한다', () => {
    expect(bisectAngle(Math.PI / 3, Math.PI / 3)).toBeCloseTo(Math.PI / 3, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => bisectAngle(value, 0)).toThrow(RangeError);
    expect(() => bisectAngle(0, value)).toThrow(RangeError);
  });
});

describe('clampAngle - CCW interval clamp', () => {
  test('interval 안에 있으면 angle을 그대로 반환한다', () => {
    expect(clampAngle(Math.PI / 4, 0, Math.PI / 2)).toBeCloseTo(Math.PI / 4, 10);
  });

  test('start 경계값은 포함이다', () => {
    expect(clampAngle(0, 0, Math.PI / 2)).toBe(0);
  });

  test('end 경계값은 포함이다', () => {
    expect(clampAngle(Math.PI / 2, 0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('π는 [0, π/2] 밖에서 end(π/2)에 더 가깝다', () => {
    expect(clampAngle(Math.PI, 0, Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('-π/4는 [0, π/2] 밖에서 start(0)에 더 가깝다', () => {
    expect(clampAngle(-Math.PI / 4, 0, Math.PI / 2)).toBeCloseTo(0, 10);
  });

  test('tie: [0, π]의 양끝과 등거리인 3π/2는 start(0)를 반환한다', () => {
    expect(clampAngle((3 * Math.PI) / 2, 0, Math.PI)).toBeCloseTo(0, 10);
  });

  test('start === end는 zero-length interval로 start를 반환한다', () => {
    expect(clampAngle(Math.PI / 4, Math.PI / 3, Math.PI / 3)).toBeCloseTo(Math.PI / 3, 10);
  });

  test('start=0, end=2π는 full-turn equivalent zero-length interval로 start를 반환한다', () => {
    expect(clampAngle(Math.PI / 3, 0, 2 * Math.PI)).toBeCloseTo(0, 10);
  });

  test('wrap-around interval: angle=0이 [-π/4, π/4] 안에 있다', () => {
    expect(clampAngle(0, -Math.PI / 4, Math.PI / 4)).toBe(0);
  });

  test('wrap-around interval: angle=π/2는 [-π/4, π/4] 밖에서 end(π/4)에 더 가깝다', () => {
    expect(clampAngle(Math.PI / 2, -Math.PI / 4, Math.PI / 4)).toBeCloseTo(Math.PI / 4, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => clampAngle(value, 0, Math.PI)).toThrow(RangeError);
    expect(() => clampAngle(0, value, Math.PI)).toThrow(RangeError);
    expect(() => clampAngle(0, 0, value)).toThrow(RangeError);
  });
});

describe('supplement - 보각', () => {
  test('π/6의 보각은 5π/6이다', () => {
    expect(supplement(Math.PI / 6)).toBeCloseTo((5 * Math.PI) / 6, 10);
  });

  test('0의 보각은 π이다', () => {
    expect(supplement(0)).toBeCloseTo(Math.PI, 10);
  });

  test('π의 보각은 0이다', () => {
    expect(supplement(Math.PI)).toBeCloseTo(0, 10);
  });

  test('π/2의 보각은 π/2이다', () => {
    expect(supplement(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('결과를 wrap하지 않는다: 2π의 보각은 π - 2π = -π이다', () => {
    expect(supplement(2 * Math.PI)).toBeCloseTo(-Math.PI, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => supplement(value)).toThrow(RangeError);
  });
});

describe('complement - 여각', () => {
  test('π/6의 여각은 π/3이다', () => {
    expect(complement(Math.PI / 6)).toBeCloseTo(Math.PI / 3, 10);
  });

  test('0의 여각은 π/2이다', () => {
    expect(complement(0)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('π/2의 여각은 0이다', () => {
    expect(complement(Math.PI / 2)).toBeCloseTo(0, 10);
  });

  test('π/4의 여각은 π/4이다', () => {
    expect(complement(Math.PI / 4)).toBeCloseTo(Math.PI / 4, 10);
  });

  test('결과를 wrap하지 않는다: π의 여각은 π/2 - π = -π/2이다', () => {
    expect(complement(Math.PI)).toBeCloseTo(-Math.PI / 2, 10);
  });

  test.each(nonFiniteValues)('finite하지 않은 인자 %s는 RangeError를 던진다', (value) => {
    expect(() => complement(value)).toThrow(RangeError);
  });
});
