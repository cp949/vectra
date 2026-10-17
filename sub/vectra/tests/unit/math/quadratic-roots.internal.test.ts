/**
 * quadratic-roots.internal 단위 테스트.
 *
 * 수치 안정 2차 방정식 solver의 계약을 고정한다.
 * - 상쇄 없는 근 계산(q = -0.5·(b + sign(b)·√D))
 * - 퇴화·중복근 판정이 계수 scale에 독립
 * - 경계: a=0, b=0, c=0, 중복근, 음의 판별식, 거의 중복근
 */
import { describe, expect, test } from 'vitest';
import { quadraticRoots, quadraticRootsInUnitInto } from '../../../src/math/quadratic-roots.internal';

/** 상대 오차. expected가 0이면 절대 오차를 돌려준다. */
function relErr(actual: number, expected: number): number {
  return expected === 0 ? Math.abs(actual) : Math.abs(actual - expected) / Math.abs(expected);
}

/** 근을 구한다. */
function roots(a: number, b: number, c: number, relEps?: number): number[] {
  return quadraticRoots(a, b, c, relEps);
}

describe('quadraticRoots - 정밀도', () => {
  test('b가 매우 크면 작은 근을 상쇄 없이 구한다', () => {
    // x² + 1e8·x + 1 = 0. 작은 근은 -1e-8에 가깝다.
    const r = roots(1, 1e8, 1);
    expect(r).toHaveLength(2);
    expect(relErr(r[1] as number, -1e-8)).toBeLessThan(1e-15);
    expect(relErr(r[0] as number, -1e8)).toBeLessThan(1e-15);
  });

  test('b가 음수로 매우 크면 작은 근을 상쇄 없이 구한다', () => {
    const r = roots(1, -1e8, 1);
    expect(r).toHaveLength(2);
    expect(relErr(r[0] as number, 1e-8)).toBeLessThan(1e-15);
    expect(relErr(r[1] as number, 1e8)).toBeLessThan(1e-15);
  });

  test('근을 오름차순으로 push한다', () => {
    expect(roots(-1, 3, -2)).toEqual([1, 2]);
    expect(roots(1, -3, 2)).toEqual([1, 2]);
  });
});

describe('quadraticRoots - scale 불변성', () => {
  const scales = [1e-8, 1, 1e8];

  test.each(scales)('계수 전체를 %s배 해도 서로 다른 두 근이 같다', (s) => {
    const r = roots(1 * s, -3 * s, 2 * s);
    expect(r).toHaveLength(2);
    expect(relErr(r[0] as number, 1)).toBeLessThan(1e-12);
    expect(relErr(r[1] as number, 2)).toBeLessThan(1e-12);
  });

  test.each(scales)('계수 전체를 %s배 해도 중복근이 1개로 유지된다', (s) => {
    const r = roots(1 * s, -2 * s, 1 * s);
    expect(r).toHaveLength(1);
    expect(relErr(r[0] as number, 1)).toBeLessThan(1e-12);
  });

  test.each(scales)('계수 전체를 %s배 해도 음의 판별식이면 근이 없다', (s) => {
    expect(roots(1 * s, 0, 1 * s)).toHaveLength(0);
  });

  test.each(scales)('계수 전체를 %s배 해도 거의 중복인 두 근이 구분된다', (s) => {
    // (x - 1)(x - 1.001) = x² - 2.001x + 1.001. 근 간격 1e-3은 scale과 무관하게 두 근이다.
    const r = roots(1 * s, -2.001 * s, 1.001 * s);
    expect(r).toHaveLength(2);
    expect(relErr(r[0] as number, 1)).toBeLessThan(1e-12);
    expect(relErr(r[1] as number, 1.001)).toBeLessThan(1e-12);
  });
});

describe('quadraticRoots - 경계', () => {
  test('a === 0이면 선형 근 하나를 반환한다', () => {
    expect(roots(0, 2, -4)).toEqual([2]);
  });

  test('a === 0이고 b === 0이면 근이 없다', () => {
    expect(roots(0, 0, 5)).toEqual([]);
    expect(roots(0, 0, 0)).toEqual([]);
  });

  test('b === 0이면 ±√(-c/a)를 반환한다', () => {
    const r = roots(1, 0, -4);
    expect(r).toHaveLength(2);
    expect(r[0]).toBeCloseTo(-2, 14);
    expect(r[1]).toBeCloseTo(2, 14);
  });

  test('c === 0이면 0과 -b/a를 반환한다', () => {
    expect(roots(1, -3, 0)).toEqual([0, 3]);
    expect(roots(1, 3, 0)).toEqual([-3, 0]);
  });

  test('b === 0이고 c === 0이면 0 중복근 하나를 반환한다', () => {
    expect(roots(2, 0, 0)).toEqual([0]);
  });

  test('판별식이 정확히 0이면 중복근 하나를 반환한다', () => {
    expect(roots(1, -2, 1)).toEqual([1]);
  });

  test('판별식이 음수이면 근이 없다', () => {
    expect(roots(1, 1, 1)).toEqual([]);
  });

  test('quadraticRootsInUnitInto는 out에 기존 원소가 있으면 뒤에 이어 붙인다', () => {
    const out = [9];
    quadraticRootsInUnitInto(out, 1, -3 / 2, 0.5, false);
    expect(out).toEqual([9, 0.5]);
  });

  test('상대 판별식이 relEps 이하이면 중복근으로 본다', () => {
    // D = b² - 4ac = 4e-14 (b² ≈ 4). 상대값 1e-14 → relEps 1e-12 이하라 중복근.
    const r = roots(1, -2, 1 - 1e-14);
    expect(r).toHaveLength(1);
    expect(r[0]).toBeCloseTo(1, 12);
  });

  test('relEps를 낮추면 같은 입력이 두 근으로 분리된다', () => {
    const r = roots(1, -2, 1 - 1e-14, 1e-16);
    expect(r).toHaveLength(2);
  });
});

describe('quadraticRootsInUnitInto', () => {
  /** 근을 구한 뒤 단위 구간 밖을 걸러낸 기준 결과 */
  function filtered(a: number, b: number, c: number, closedUnit: boolean): number[] {
    return roots(a, b, c).filter((t) => (closedUnit ? t >= 0 && t <= 1 : t > 0 && t < 1));
  }

  // 선형, 중복근, 음의 판별식, 경계 근 0과 1, 일반 근을 모두 포함한다.
  const cases: [number, number, number][] = [
    [0, 2, -1],
    [0, 0, 1],
    [1, -1, 0.25],
    [1, 0, 1],
    [1, -1, 0],
    [1, -2, 1],
    [1, -1.5, 0.5],
    [-1, 1.5, -0.5],
    [4, -8, 3],
    [-8, 8, -1],
    [1, 1e8, 1],
    [1, -3, 2],
    [1, -2.001, 1.001],
  ];

  test.each([false, true])('closedUnit=%s이면 근을 구한 뒤 구간 밖을 걸러낸 결과와 같다', (closedUnit) => {
    for (const [a, b, c] of cases) {
      for (const s of [1e-8, 1, 1e8]) {
        const out: number[] = [];
        quadraticRootsInUnitInto(out, a * s, b * s, c * s, closedUnit);
        expect(out).toEqual(filtered(a * s, b * s, c * s, closedUnit));
      }
    }
  });

  test('closed는 경계 0과 1을 포함하고 open은 제외한다', () => {
    // t(t - 1) = 0 → 근 0, 1
    const closed: number[] = [];
    const open: number[] = [];
    quadraticRootsInUnitInto(closed, 1, -1, 0, true);
    quadraticRootsInUnitInto(open, 1, -1, 0, false);
    expect(closed).toEqual([0, 1]);
    expect(open).toEqual([]);
  });
});
