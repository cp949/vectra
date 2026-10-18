/**
 * ellipse-ellipse-solver.internal의 구간 한정 4차 근 후보 solver 단위 테스트.
 *
 * pushQuarticRootCandidates는 정렬·중복 제거 없이 근 후보를 push한다. test는 정렬한 뒤 기대 근과 비교한다.
 * 최고차 계수가 0에 가까운 경우, 부호를 바꾸지 않는 중근, 구간 끝의 근, 변곡점 분기를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { pushQuarticRootCandidates } from '../../../src/intersects/ellipse-ellipse-solver.internal';

type Coeffs = [c0: number, c1: number, c2: number, c3: number, c4: number];

/**
 * 오름차순 계수의 `[lo, hi]` 근 후보를 부호 변화 근과 임계점 후보로 나눠 정렬해 반환한다.
 * 각 test가 solver 호출과 정렬을 반복하지 않게 한다.
 */
function solve(coeffs: Coeffs, lo: number, hi: number): { roots: number[]; tangents: number[] } {
  const roots: number[] = [];
  const tangents: number[] = [];
  pushQuarticRootCandidates(roots, tangents, ...coeffs, lo, hi);
  return { roots: roots.sort((a, b) => a - b), tangents: tangents.sort((a, b) => a - b) };
}

/** 부호 변화로 찾은 근만 정렬해 반환한다. 임계점 후보가 없어야 하는 다항식에 쓴다. */
function candidates(coeffs: Coeffs, lo: number, hi: number): number[] {
  const { roots, tangents } = solve(coeffs, lo, hi);
  expect(tangents).toEqual([]);
  return roots;
}

/** 근 후보가 기대 근과 개수와 값 모두 일치하는지 확인한다. 근사값 비교 자릿수는 `digits`다. */
function expectRoots(actual: number[], expected: number[], digits = 12): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i] as number, digits);
  }
}

describe('pushQuarticRootCandidates', () => {
  test('서로 다른 네 실근을 모두 구한다', () => {
    // (x-1)(x-2)(x-3)(x-4) = x⁴ - 10x³ + 35x² - 50x + 24
    expectRoots(candidates([24, -50, 35, -10, 1], 0, 5), [1, 2, 3, 4]);
  });

  test('구간 밖의 근은 내지 않는다', () => {
    expectRoots(candidates([24, -50, 35, -10, 1], 1.5, 3.5), [2, 3]);
  });

  test('biquadratic의 대칭 근을 구한다', () => {
    // x⁴ - 5x² + 4 = (x² - 1)(x² - 4)
    expectRoots(candidates([4, 0, -5, 0, 1], -3, 3), [-2, -1, 1, 2]);
  });

  test('최고차 계수가 1e-20 규모여도 구간 안의 근을 잃지 않는다', () => {
    // 1e-20·x⁴ + x² - 0.25: 큰 근 두 개는 구간 밖이고 ±0.5만 구간 안에 있다.
    expectRoots(candidates([-0.25, 0, 1, 0, 1e-20], -1, 1), [-0.5, 0.5]);
  });

  test('3차 이하 다항식도 같은 방식으로 푼다', () => {
    // x³ - x = x(x - 1)(x + 1)
    expectRoots(candidates([0, -1, 0, 1, 0], -2, 2), [-1, 0, 1]);
    // 2차식 x² - 2
    expectRoots(candidates([-2, 0, 1, 0, 0], -2, 2), [-Math.SQRT2, Math.SQRT2]);
  });

  test('1차식은 임계점 없이 근 하나를 구한다', () => {
    expectRoots(candidates([-1, 2, 0, 0, 0], -2, 2), [0.5]);
  });

  test('실근이 없으면 근을 내지 않고 임계점만 접점 후보로 낸다', () => {
    // x⁴ + x² + 1은 모든 x에서 양수다. 임계점 x = 0은 이웃 구간에 근이 없어 접점 후보다.
    const { roots, tangents } = solve([1, 0, 1, 0, 1], -2, 2);
    expect(roots).toEqual([]);
    expectRoots(tangents, [0]);
    // 상수 다항식
    expect(candidates([1, 0, 0, 0, 0], -2, 2)).toEqual([]);
  });

  test('근이 없는 W 모양 다항식은 임계점 세 개를 모두 후보로 낸다', () => {
    // x⁴ - 2x² + 1.5의 최솟값은 0.5라 근이 없다. 임계점은 -1, 0, 1이다.
    const { roots, tangents } = solve([1.5, 0, -2, 0, 1], -2, 2);
    expect(roots).toEqual([]);
    expectRoots(tangents, [-1, 0, 1]);
  });

  test('부호를 바꾸지 않는 거의 중근은 임계점에서 접점 후보로 낸다', () => {
    // x² + 1e-20: 최솟값 1e-20이 양수라 부호가 바뀌지 않는다. 임계점 0이 접점 후보다.
    const { roots, tangents } = solve([1e-20, 0, 1, 0, 0], -1, 1);
    expect(roots).toEqual([]);
    expectRoots(tangents, [0]);
  });

  test('이웃 구간에 근이 있는 임계점은 후보로 내지 않는다', () => {
    // x² - 1e-6: 두 근 ±1e-3 사이의 꼭짓점 x = 0은 근이 아니다.
    expectRoots(candidates([-1e-6, 0, 1, 0, 0], -1, 1), [-1e-3, 1e-3], 15);
  });

  test('구간 끝에서 값이 정확히 0인 근을 낸다', () => {
    // x² - 1을 [-1, 1]에서 푼다. 끝점 ±1이 근이다.
    expectRoots(candidates([-1, 0, 1, 0, 0], -1, 1), [-1, 1]);
  });

  test('임계점에서 값이 정확히 0인 중근을 한 번만 낸다', () => {
    // x⁴ - x² = x²(x² - 1): x = 0이 중근이자 임계점이다.
    expectRoots(candidates([0, 0, -1, 0, 1], -0.5, 2), [0, 1]);
  });

  test('1차 도함수가 변곡점에서 정확히 0이면 그 점을 임계점으로 쓴다', () => {
    // x⁴ - 1: 2차 도함수 12x²의 중근 0에서 1차 도함수 4x³도 0이다. 근은 ±1이다.
    expectRoots(candidates([-1, 0, 0, 0, 1], -2, 2), [-1, 1]);
  });

  test('작은 1차 계수로 붙은 두 근은 하나로 합쳐질 수 있다', () => {
    // x⁴ + x² + 1e-11 x = x(x³ + x + 1e-11): 근은 0과 약 -1e-11이다. 둘 다 1e-11 안에 있다.
    const { roots, tangents } = solve([0, 1e-11, 1, 0, 1], -1, 1);
    expect(roots.length + tangents.length).toBeGreaterThanOrEqual(1);
    for (const x of [...roots, ...tangents]) expect(Math.abs(x)).toBeLessThanOrEqual(2e-11);
  });
});
