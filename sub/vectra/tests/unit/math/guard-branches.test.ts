/**
 * math 경계 분기 테스트.
 *
 * `lcm(0, 0)`, 선형 근이 단위 구간 밖인 경우, 선형 fallback의 NaN 근, 명시 `eps`에서 판별식이
 * `eps`를 넘는 2차식, 명시 `eps`로 근 dedupe가 일어나는 3차식, 결과가 `-0`으로 계산되는
 * `sqrt1pm1`을 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { lcm } from '../../../src/math/lcm';
import { quadraticRootsInUnitInto } from '../../../src/math/quadratic-roots.internal';
import { solveCubic } from '../../../src/math/solve-cubic';
import { solveQuadratic } from '../../../src/math/solve-quadratic';
import { sqrt1pm1 } from '../../../src/math/sqrt1pm1';

describe('lcm', () => {
  test('두 인자가 모두 0이면 gcd가 0이라 0을 돌려준다', () => {
    expect(lcm(0, 0)).toBe(0);
  });
});

describe('quadraticRootsInUnitInto — 선형 fallback', () => {
  test('a가 0이고 선형 근이 구간 밖이면 out에 아무것도 추가하지 않는다', () => {
    // t = 5
    const closed = [9];
    quadraticRootsInUnitInto(closed, 0, 1, -5, true);
    expect(closed).toEqual([9]);

    const open = [9];
    quadraticRootsInUnitInto(open, 0, 1, -5, false);
    expect(open).toEqual([9]);
  });
});

describe('solveQuadratic', () => {
  test('a와 b가 모두 0이면 선형 fallback이 NaN이라 빈 배열을 돌려준다', () => {
    expect(solveQuadratic(0, 0, 1)).toEqual([]);
  });

  test('명시한 eps보다 판별식이 크면 두 근을 돌려준다', () => {
    expect(solveQuadratic(1, -3, 2, 1e-9)).toEqual([1, 2]);
  });
});

describe('solveCubic — 명시 eps의 근 dedupe', () => {
  test('판별식은 eps² 밖이지만 두 근 간격이 eps 이하이면 앞 근 하나로 합친다', () => {
    // x(x - 0.09)(x - 10). 0과 0.09는 eps 0.1 이내라 0 하나만 남는다.
    const roots = solveCubic(1, -10.09, 0.9, 0, 0.1);
    expect(roots).toHaveLength(2);
    expect(roots[0]).toBeCloseTo(0, 9);
    expect(roots[1]).toBeCloseTo(10, 9);
  });
});

describe('sqrt1pm1', () => {
  test('결과가 -0으로 계산되는 아주 작은 음수는 +0으로 정리한다', () => {
    // -5e-324 / 2는 round-to-even으로 -0이다.
    expect(Object.is(sqrt1pm1(-Number.MIN_VALUE), 0)).toBe(true);
  });
});
