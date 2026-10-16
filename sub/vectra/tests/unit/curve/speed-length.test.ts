/**
 * speed-length kernel 단위 테스트.
 *
 * curve arc-length 적분기 9벌이 공유하는 speedLength, speedLengthAtT, speedTAtLength를
 * 해석해를 돌려주는 구간 적분기(`integrate`)로 직접 검증한다.
 * 구간 적분기는 곡선별 adapter가 소유하므로 여기서는 kernel 로직만 본다.
 * 상수·선형 속력의 해석해, integrate 인자(구간 끝, segments 기본값), t clamp와 NaN,
 * 단조 증가, from === to, distance 경계, round-trip, 탐색 옵션(tolerance, maxIterations)의 영향을 다룬다.
 */
import { describe, expect, test, vi } from 'vitest';
import type { CurveSpeed } from '../../../src/curve/curve-speed.internal';
import { speedLength, speedLengthAtT, speedTAtLength } from '../../../src/curve/speed-length.internal';

/**
 * 구간 [0, 3]에서 속력이 항상 2인 곡선을 만든다.
 * 구간 적분은 해석해 2 * (b - a)다. 전체 길이는 6이다.
 */
function constantSpeed(): CurveSpeed {
  return { integrate: (a, b) => 2 * (b - a), from: 0, to: 3 };
}

/**
 * 구간 [0, 1]에서 속력이 param과 같은 곡선을 만든다.
 * 구간 적분은 해석해 (b² - a²) / 2다. t까지의 길이는 t²/2이고 t에 대해 순증가한다.
 */
function linearSpeed(): CurveSpeed {
  return { integrate: (a, b) => (b * b - a * a) / 2, from: 0, to: 1 };
}

describe('speedLength', () => {
  test('상수 속력 2, 구간 [0, 3]이면 길이는 6이다', () => {
    expect(speedLength(constantSpeed())).toBe(6);
  });

  test('선형 속력이면 길이는 1/2이다', () => {
    expect(speedLength(linearSpeed())).toBe(0.5);
  });

  test('구간 적분기에 from, to, 기본 segments 12를 넘긴다', () => {
    const integrate = vi.fn(() => 1);
    speedLength({ integrate, from: 1, to: 4 });
    expect(integrate).toHaveBeenCalledTimes(1);
    expect(integrate).toHaveBeenCalledWith(1, 4, 12);
  });

  test('options.segments를 구간 적분기에 그대로 넘긴다', () => {
    const integrate = vi.fn(() => 1);
    speedLength({ integrate, from: 0, to: 1 }, { segments: 25 });
    expect(integrate).toHaveBeenCalledWith(0, 1, 25);
  });

  test('from === to이면 적분기를 부르지 않고 0을 반환한다', () => {
    const integrate = vi.fn(() => 5);
    expect(speedLength({ integrate, from: 2, to: 2 })).toBe(0);
    expect(integrate).not.toHaveBeenCalled();
  });

  test('적분 합이 음수이면 부호를 뒤집어 양수 길이를 반환한다', () => {
    const reversed: CurveSpeed = { integrate: (a, b) => 2 * (b - a), from: 3, to: 0 };
    expect(speedLength(reversed)).toBe(6);
  });

  test('적분 합이 NaN이면 NaN을 반환한다', () => {
    expect(speedLength({ integrate: () => Number.NaN, from: 0, to: 1 })).toBeNaN();
  });
});

describe('speedLengthAtT', () => {
  test('t가 0이면 0을 반환한다', () => {
    expect(speedLengthAtT(constantSpeed(), 0)).toBe(0);
  });

  test('t가 음수이면 0을 반환한다', () => {
    expect(speedLengthAtT(constantSpeed(), -1)).toBe(0);
    expect(speedLengthAtT(constantSpeed(), -0)).toBe(0);
  });

  test('t가 0 이하이면 적분기를 부르지 않는다', () => {
    const integrate = vi.fn(() => 1);
    speedLengthAtT({ integrate, from: 0, to: 1 }, -1);
    expect(integrate).not.toHaveBeenCalled();
  });

  test('t가 1이면 전체 길이와 같다', () => {
    expect(speedLengthAtT(constantSpeed(), 1)).toBe(speedLength(constantSpeed()));
  });

  test('t가 1을 넘으면 1로 clamp한다', () => {
    expect(speedLengthAtT(constantSpeed(), 2)).toBe(speedLengthAtT(constantSpeed(), 1));
    expect(speedLengthAtT(constantSpeed(), Number.POSITIVE_INFINITY)).toBe(speedLengthAtT(constantSpeed(), 1));
  });

  test('상수 속력이면 t=0.5의 길이는 3이다', () => {
    expect(speedLengthAtT(constantSpeed(), 0.5)).toBe(3);
  });

  test('선형 속력이면 t까지의 길이는 t²/2이다', () => {
    for (const t of [0.1, 0.5, 0.9]) {
      expect(speedLengthAtT(linearSpeed(), t)).toBeCloseTo((t * t) / 2, 12);
    }
  });

  test('t가 증가하면 길이도 단조 증가한다', () => {
    let prev = 0;
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const length = speedLengthAtT(linearSpeed(), t);
      expect(length).toBeGreaterThan(prev);
      prev = length;
    }
  });

  test('구간 끝은 from + (to - from) * t이고 segments 기본값은 12다', () => {
    const integrate = vi.fn(() => 1);
    speedLengthAtT({ integrate, from: 1, to: 4 }, 0.5);
    expect(integrate).toHaveBeenCalledWith(1, 2.5, 12);
  });

  test('t가 1을 넘으면 구간 끝은 to이고 options.segments를 넘긴다', () => {
    const integrate = vi.fn(() => 1);
    speedLengthAtT({ integrate, from: 1, to: 4 }, 7, { segments: 3 });
    expect(integrate).toHaveBeenCalledWith(1, 4, 3);
  });

  test('from === to이면 t와 무관하게 0을 반환한다', () => {
    const integrate = vi.fn(() => 1);
    const zero: CurveSpeed = { integrate, from: 4, to: 4 };
    expect(speedLengthAtT(zero, 0.5)).toBe(0);
    expect(speedLengthAtT(zero, 1)).toBe(0);
    expect(speedLengthAtT(zero, Number.NaN)).toBe(0);
    expect(integrate).not.toHaveBeenCalled();
  });

  test('from !== to이고 t가 NaN이면 NaN을 반환한다', () => {
    expect(speedLengthAtT(constantSpeed(), Number.NaN)).toBeNaN();
  });

  test('from이 0이 아니어도 구간 끝은 from + (to - from) * t이다', () => {
    const shifted: CurveSpeed = { integrate: (a, b) => 2 * (b - a), from: 1, to: 4 };
    expect(speedLengthAtT(shifted, 0.5)).toBe(3);
  });

  test('적분 합이 음수이면 부호를 뒤집어 양수 길이를 반환한다', () => {
    const reversed: CurveSpeed = { integrate: (a, b) => 2 * (b - a), from: 3, to: 0 };
    expect(speedLengthAtT(reversed, 0.5)).toBe(3);
  });
});

describe('speedTAtLength', () => {
  test('distance가 0이면 0을 반환한다', () => {
    expect(speedTAtLength(constantSpeed(), 0)).toBe(0);
  });

  test('distance가 음수이면 0을 반환한다', () => {
    expect(speedTAtLength(constantSpeed(), -1)).toBe(0);
  });

  test('distance가 총길이 이상이면 1을 반환한다', () => {
    const total = speedLengthAtT(constantSpeed(), 1);
    expect(speedTAtLength(constantSpeed(), total)).toBe(1);
    expect(speedTAtLength(constantSpeed(), total * 2)).toBe(1);
  });

  test('총길이가 0이면 양수 distance도 0을 반환한다', () => {
    const zero: CurveSpeed = { integrate: () => 0, from: 0, to: 1 };
    expect(speedTAtLength(zero, 1)).toBe(0);
    expect(speedTAtLength({ integrate: () => 1, from: 2, to: 2 }, 1)).toBe(0);
  });

  test('총길이는 speedLengthAtT(curve, 1)로 구한다', () => {
    const integrate = vi.fn((a: number, b: number) => 2 * (b - a));
    speedTAtLength({ integrate, from: 0, to: 3 }, 100);
    expect(integrate).toHaveBeenCalledTimes(1);
    expect(integrate).toHaveBeenCalledWith(0, 3, 12);
  });

  test('상수 속력이면 distance/총길이가 t와 같다', () => {
    expect(speedTAtLength(constantSpeed(), 1.5)).toBeCloseTo(0.25, 6);
    expect(speedTAtLength(constantSpeed(), 3)).toBeCloseTo(0.5, 6);
  });

  test('반환 t가 항상 [0, 1] 범위 안에 있다', () => {
    for (const distance of [-5, 0, 0.1, 0.3, 0.5, 1, 100]) {
      const t = speedTAtLength(linearSpeed(), distance);
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  test('round-trip: lengthAtT(tAtLength(len)) ≈ len', () => {
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const target = speedLengthAtT(linearSpeed(), t);
      const recovered = speedTAtLength(linearSpeed(), target);
      expect(speedLengthAtT(linearSpeed(), recovered)).toBeCloseTo(target, 6);
      expect(recovered).toBeCloseTo(t, 6);
    }
  });

  test('distance가 NaN이면 탐색이 한쪽으로 몰려 유한한 값을 반환한다', () => {
    const t = speedTAtLength(constantSpeed(), Number.NaN);
    expect(Number.isFinite(t)).toBe(true);
    expect(t).toBeLessThan(1e-6);
  });

  test('tolerance가 크면 이른 탐색 종료로 오차가 커진다', () => {
    const exact = speedTAtLength(linearSpeed(), 0.1);
    const coarse = speedTAtLength(linearSpeed(), 0.1, { tolerance: 0.1 });
    expect(Math.abs(coarse - exact)).toBeGreaterThan(1e-4);
    expect(Math.abs(coarse - exact)).toBeLessThan(0.1);
  });

  test('maxIterations가 0이면 탐색 없이 구간 중점 0.5를 반환한다', () => {
    expect(speedTAtLength(linearSpeed(), 0.1, { maxIterations: 0 })).toBe(0.5);
  });

  test('maxIterations가 작으면 큰 maxIterations보다 오차가 크다', () => {
    const exact = speedTAtLength(linearSpeed(), 0.1);
    const few = speedTAtLength(linearSpeed(), 0.1, { maxIterations: 3 });
    expect(Math.abs(few - exact)).toBeGreaterThan(1e-3);
  });

  test('segments 옵션이 총길이 계산과 탐색의 모든 적분 호출에 전달된다', () => {
    const integrate = vi.fn((a: number, b: number) => 2 * (b - a));
    speedTAtLength({ integrate, from: 0, to: 3 }, 3, { segments: 1 });
    expect(integrate.mock.calls.length).toBeGreaterThan(1);
    for (const call of integrate.mock.calls) {
      expect((call as unknown[])[2]).toBe(1);
    }
  });
});
