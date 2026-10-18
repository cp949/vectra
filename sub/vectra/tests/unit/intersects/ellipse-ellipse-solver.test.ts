/**
 * ellipse-ellipse-solver.internal의 구간 한정 근 후보 solver 단위 테스트.
 *
 * pushConicQuarticRootCandidates는 `B·u² + E·u + D·(A x² - 1)`, `u = P x² + Q x + R` 형태의 식을 푼다.
 * 정렬·중복 제거 없이 후보를 push하므로 test는 정렬한 뒤 기대 근과 비교한다.
 * 최고차 계수가 0에 가까운 경우, 전개하면 반올림에 묻히는 작은 항, 부호를 바꾸지 않는 중근,
 * 구간 끝의 근, 변곡점 분기를 다룬다.
 */
import { describe, expect, test } from 'vitest';
import {
  type ConicQuartic,
  pushConicQuarticRootCandidates,
} from '../../../src/intersects/ellipse-ellipse-solver.internal';

/**
 * 식 계수를 만든다. 지정하지 않은 계수는 0이다.
 * 각 test는 필요한 항만 적는다.
 */
function form(coeffs: Partial<ConicQuartic>): ConicQuartic {
  return { P: 0, Q: 0, R: 0, B: 0, E: 0, D: 0, A: 0, ...coeffs };
}

/**
 * `[lo, hi]` 근 후보를 부호 변화 근과 임계점 후보로 나눠 정렬해 반환한다.
 * 각 test가 solver 호출과 정렬을 반복하지 않게 한다.
 */
function solve(f: ConicQuartic, lo: number, hi: number): { roots: number[]; tangents: number[] } {
  const roots: number[] = [];
  const tangents: number[] = [];
  pushConicQuarticRootCandidates(roots, tangents, f, lo, hi);
  return { roots: roots.sort((a, b) => a - b), tangents: tangents.sort((a, b) => a - b) };
}

/** 부호 변화로 찾은 근만 정렬해 반환한다. 임계점 후보가 없어야 하는 식에 쓴다. */
function candidates(f: ConicQuartic, lo: number, hi: number): number[] {
  const { roots, tangents } = solve(f, lo, hi);
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

// (x² - 5x + 5)² - 1 = (x - 1)(x - 2)(x - 3)(x - 4)
const FOUR_ROOTS = form({ P: 1, Q: -5, R: 5, B: 1, D: 1 });

describe('pushConicQuarticRootCandidates', () => {
  test('서로 다른 네 실근을 모두 구한다', () => {
    expectRoots(candidates(FOUR_ROOTS, 0, 5), [1, 2, 3, 4]);
  });

  test('구간 밖의 근은 내지 않는다', () => {
    expectRoots(candidates(FOUR_ROOTS, 1.5, 3.5), [2, 3]);
  });

  test('변곡점 하나만 구간 안에 있어도 근을 구한다', () => {
    // 변곡점은 2.5 ± √(5/12) ≈ 1.855, 3.145다. [2.5, 5]에는 뒤쪽 하나만 들어온다.
    expectRoots(candidates(FOUR_ROOTS, 2.5, 5), [3, 4]);
  });

  test('biquadratic의 대칭 근을 구한다', () => {
    // (x² - 2.5)² - 2.25 = (x² - 1)(x² - 4)
    expectRoots(candidates(form({ P: 1, R: -2.5, B: 1, D: 2.25 }), -3, 3), [-2, -1, 1, 2]);
  });

  test('최고차 계수가 1e-20 규모여도 구간 안의 근을 잃지 않는다', () => {
    // 1e-20·x⁴ + x² - 0.25: 큰 근 두 개는 구간 밖이고 ±0.5만 구간 안에 있다.
    expectRoots(candidates(form({ P: 1, B: 1e-20, E: 1, D: 0.25 }), -1, 1), [-0.5, 0.5]);
  });

  test('전개하면 반올림에 묻히는 작은 항이 만드는 가까운 두 근을 구한다', () => {
    // 2.5e7·(1e6 (x - 0.4)²)² + 100 (x² - 1): 전개 계수는 1e19 규모이고 100 규모 항이 반올림에 묻힌다.
    // 그대로 계산하면 0.4 ± 4.3e-5의 두 근이 나온다.
    const f = form({ P: 1e6, Q: -8e5, R: 1.6e5, B: 2.5e7, D: 100, A: 1 });
    expectRoots(candidates(f, -1, 1), [0.399957185660731, 0.400042813466397]);
  });

  test('2차식은 E 항만으로 푼다', () => {
    expectRoots(candidates(form({ P: 1, R: -2, E: 1 }), -2, 2), [-Math.SQRT2, Math.SQRT2]);
  });

  test('1차식은 임계점 없이 근 하나를 구한다', () => {
    expectRoots(candidates(form({ Q: 2, R: -1, E: 1 }), -2, 2), [0.5]);
  });

  test('실근이 없으면 근을 내지 않고 임계점만 접점 후보로 낸다', () => {
    // x⁴ + x² + 1은 모든 x에서 양수다. 임계점 x = 0은 이웃 구간에 근이 없어 접점 후보다.
    const { roots, tangents } = solve(form({ P: 1, B: 1, E: 1, D: -1 }), -2, 2);
    expect(roots).toEqual([]);
    expectRoots(tangents, [0]);
    // 상수 식 1
    expect(candidates(form({ D: -1 }), -2, 2)).toEqual([]);
  });

  test('근이 없는 W 모양 식은 임계점 세 개를 모두 후보로 낸다', () => {
    // (x² - 1)² + 0.5의 최솟값은 0.5라 근이 없다. 임계점은 -1, 0, 1이다.
    const { roots, tangents } = solve(form({ P: 1, R: -1, B: 1, D: -0.5 }), -2, 2);
    expect(roots).toEqual([]);
    expectRoots(tangents, [-1, 0, 1]);
  });

  test('부호를 바꾸지 않는 거의 중근은 임계점에서 접점 후보로 낸다', () => {
    // x² + 1e-20: 최솟값 1e-20이 양수라 부호가 바뀌지 않는다. 임계점 0이 접점 후보다.
    const { roots, tangents } = solve(form({ P: 1, R: 1e-20, E: 1 }), -1, 1);
    expect(roots).toEqual([]);
    expectRoots(tangents, [0]);
  });

  test('이웃 구간에 근이 있는 임계점은 후보로 내지 않는다', () => {
    // x² - 1e-6: 두 근 ±1e-3 사이의 꼭짓점 x = 0은 근이 아니다.
    expectRoots(candidates(form({ P: 1, R: -1e-6, E: 1 }), -1, 1), [-1e-3, 1e-3], 15);
  });

  test('구간 끝에서 값이 정확히 0인 근을 낸다', () => {
    // x² - 1을 [-1, 1]에서 푼다. 끝점 ±1이 근이다.
    expectRoots(candidates(form({ P: 1, R: -1, E: 1 }), -1, 1), [-1, 1]);
  });

  test('임계점에서 값이 정확히 0인 중근을 한 번만 낸다', () => {
    // (x² - 0.5)² - 0.25 = x²(x² - 1): x = 0이 중근이자 임계점이다.
    expectRoots(candidates(form({ P: 1, R: -0.5, B: 1, D: 0.25 }), -0.5, 2), [0, 1]);
  });

  test('1차 도함수가 변곡점에서 정확히 0이면 그 점을 임계점으로 쓴다', () => {
    // x⁴ - 1: 2차 도함수 12x²의 중근 0에서 1차 도함수 4x³도 0이다. 근은 ±1이다.
    expectRoots(candidates(form({ P: 1, B: 1, D: 1 }), -2, 2), [-1, 1]);
  });
});
