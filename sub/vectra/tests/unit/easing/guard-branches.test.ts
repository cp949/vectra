/**
 * easing 인자 검증과 cubic bezier 수치 해법 경계 테스트.
 *
 * 비유한 `n`, `threshold`, `steepness`는 RangeError를 던지는지 확인한다. cubic bezier는 Newton이
 * 미분값 때문에 멈추는 경우와 bisection fallback으로 넘어가는 경우를 정답 곡선과 비교한다.
 */

import { describe, expect, test } from 'vitest';
import { almostIdentity } from '../../../src/easing/almost-identity';
import { cliff } from '../../../src/easing/cliff';
import { cubicBezier } from '../../../src/easing/cubic-bezier';
import { sigmoid } from '../../../src/easing/sigmoid';

/**
 * 이분법 200회로 `x(u) = t`를 정밀하게 풀어 cubic bezier의 y를 계산하는 기준 구현이다.
 * 라이브러리 구현이 Newton 8회와 bisection 8회로 근사하므로 허용 오차를 넉넉히 두고 비교한다.
 */
function referenceBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  const mix = (u: number, p1: number, p2: number): number =>
    3 * (1 - u) * (1 - u) * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (mix(mid, x1, x2) < t) lo = mid;
    else hi = mid;
  }
  return mix((lo + hi) / 2, y1, y2);
}

describe('인자 검증', () => {
  test('almostIdentity는 n이 유한하지 않으면 RangeError를 던진다', () => {
    expect(() => almostIdentity(0.5, 0.2, Number.NaN)).toThrow(/almostIdentity n must be a finite number/);
    expect(() => almostIdentity(0.5, 0.2, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('cliff는 threshold가 유한하지 않으면 RangeError를 던진다', () => {
    expect(() => cliff(0.5, { threshold: Number.NaN })).toThrow(/cliff threshold must be a finite number/);
    expect(() => cliff(0.5, { threshold: Number.NEGATIVE_INFINITY })).toThrow(RangeError);
  });

  test('sigmoid는 steepness가 유한하지 않으면 RangeError를 던진다', () => {
    expect(() => sigmoid(0.5, Number.NaN)).toThrow(/sigmoid steepness must be a finite number/);
    expect(() => sigmoid(0.5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('cubicBezier — 수치 해법 경계', () => {
  test('x 미분값이 0에 가까워 Newton이 멈춰도 유한한 값을 돌려준다', () => {
    // 두 제어점 x가 1이면 u = 1 근처에서 dx/du가 1e-9 아래로 떨어진다.
    const value = cubicBezier(0.99999, { x: 1, y: 0.5 }, { x: 1, y: 1.5 });
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeCloseTo(1, 1);
  });

  test.each([
    [0.0003, 0, 0.3, 0.02, -0.2],
    [0.0003, 0, 1.3, 0.02, 1.4],
    [0.0003, 0, 1, 0.02, 1],
    [0.0005, 0, 0.5, 0.01, 0.5],
    [0.0001, 0, 0.5, 0, 0.5],
  ])('Newton이 수렴하지 못하면 bisection으로 정답에 근접한다 (t=%s)', (t, x1, y1, x2, y2) => {
    const value = cubicBezier(t, { x: x1, y: y1 }, { x: x2, y: y2 });
    expect(Math.abs(value - referenceBezier(t, x1, y1, x2, y2))).toBeLessThan(0.02);
  });

  test('bisection의 중점이 정확히 해이면 그 지점에서 멈춘다', () => {
    // x(u) = u^3이고 t = (1/8)^3이면 첫 8회 중 3번째 중점 u = 1/8이 x(u) = t를 만족한다.
    const t = 0.125 ** 3;
    const value = cubicBezier(t, { x: 0, y: 0.5 }, { x: 0, y: 0.5 });
    expect(value).toBeCloseTo(referenceBezier(t, 0, 0.5, 0, 0.5), 12);
  });

  test('x 미분값이 1e-9 아래이면 Newton 갱신 없이 u = t로 멈추고 bisection도 쓰지 않는다', () => {
    // x(u) = 4u^3 - 6u^2 + 3u는 u = 0.5에서 변곡점이라 dx/du = 3(2u - 1)^2가 0이다.
    // t = 0.5 + 8e-6이면 dx/du = 7.7e-10이다. u = t에서 멈추면 |x(u) - t| = 8e-6으로 bisection 문턱(1e-4) 아래다.
    const t = 0.5 + 8e-6;
    const value = cubicBezier(t, { x: 1, y: 0 }, { x: 0, y: 1 });
    expect(value).toBeCloseTo(3 * (1 - t) * t * t + t ** 3, 12);
  });
});
