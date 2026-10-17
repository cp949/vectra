/**
 * 공개 solveCubic의 3차 경로 tolerance 규칙을 확인하는 테스트.
 * eps를 생략하면 계수 scale과 근 scale에 무관한 상대 판정을 쓴다.
 * eps를 명시하면 기존 절대 판정(판별식 eps², 근 dedupe eps)을 그대로 쓴다.
 */
import { describe, expect, test } from 'vitest';
import { solveCubic } from '../../../src/math/solve-cubic';

type Roots3 = [number, number, number];

/**
 * 세 근에서 a(x - r1)(x - r2)(x - r3)의 전개 계수를 만든다.
 * 근을 알고 있는 cubic을 만들어 근 개수와 위치를 정답과 비교할 때 쓴다.
 */
function coefficientsOf(roots: Roots3, scale = 1): [number, number, number, number] {
  const [x, y, z] = roots;
  return [scale, -scale * (x + y + z), scale * (x * y + y * z + z * x), -scale * x * y * z];
}

/**
 * 근 배열이 정답과 같은 개수이고 각 근이 tolerance 안에 있는지 확인한다.
 * 정답은 오름차순이어야 한다.
 */
function expectRootsNear(actual: number[], expected: number[], tolerance: number): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(Math.abs((actual[i] as number) - (expected[i] as number))).toBeLessThanOrEqual(tolerance);
  }
}

/** 근 간격이 작아 이전 구현이 붙은 근을 합치던 재현 사례. tolerance는 최소 근 간격의 30%다. */
const closeRootCases: { name: string; roots: Roots3; tolerance: number }[] = [
  { name: '0.5 근처 간격 1e-4', roots: [0.5, 0.5001, 0.5002], tolerance: 3e-5 },
  { name: '1e-6 크기 근', roots: [1e-6, 2e-6, 3e-6], tolerance: 3e-7 },
  { name: '0 포함 간격 1e-4', roots: [0, 1e-4, 2e-4], tolerance: 3e-5 },
  { name: '0.5 근처 간격 1e-5', roots: [0.5, 0.50001, 0.50002], tolerance: 3e-6 },
];

describe('math solver - solveCubic eps 생략 시 상대 판정', () => {
  test.each(closeRootCases)('근이 붙어 있어도 서로 다른 세 근을 구분한다: $name', ({ roots, tolerance }) => {
    expectRootsNear(solveCubic(...coefficientsOf(roots)), roots, tolerance);
  });

  test.each(closeRootCases)('계수 전체를 1e-14배·1e8배 해도 같은 세 근을 구한다: $name', ({ roots, tolerance }) => {
    for (const scale of [1e-14, 1e8]) {
      expectRootsNear(solveCubic(...coefficientsOf(roots, scale)), roots, tolerance);
    }
  });

  test.each([
    { name: '0.5 근처 간격 1e-4', roots: [0.5, 0.5001, 0.5002] as Roots3 },
    { name: '0 포함 간격 1e-4', roots: [0, 1e-4, 2e-4] as Roots3 },
  ])('근 전체를 1e-6배·1e6배 해도 근 개수가 같다: $name', ({ roots }) => {
    for (const k of [1e-6, 1, 1e6]) {
      const scaled = roots.map((r) => r * k) as Roots3;
      const found = solveCubic(...coefficientsOf(scaled));
      expect(found).toHaveLength(3);
      // 근 간격(1e-4·k)의 30% 이내로 일치한다.
      expectRootsNear(found, scaled, 3e-5 * k);
    }
  });

  test('간격이 충분히 큰 세 근은 그대로 구한다', () => {
    expectRootsNear(solveCubic(1, -6, 11, -6), [1, 2, 3], 1e-12);
  });

  test('3중근은 단일 원소로 합친다', () => {
    // (x - 1)³과 (x - 0.5)³은 계수 전개가 정확해 판별식이 0이다.
    expectRootsNear(solveCubic(1, -3, 3, -1), [1], 1e-12);
    expectRootsNear(solveCubic(1, -1.5, 0.75, -0.125), [0.5], 1e-12);
    for (const scale of [1e-14, 1e8]) {
      expectRootsNear(solveCubic(...coefficientsOf([1, 1, 1], scale)), [1], 1e-12);
    }
  });

  test('중근과 단근은 근 두 개로 반환한다', () => {
    // (x - 1)²(x - 3). 판별식의 상쇄 잡음이 절대 기준 1e-18을 넘어 이전 구현은 [3]만 반환했다.
    expectRootsNear(solveCubic(...coefficientsOf([1, 1, 3])), [1, 3], 1e-6);
    for (const scale of [1e-14, 1e8]) {
      expectRootsNear(solveCubic(...coefficientsOf([1, 1, 3], scale)), [1, 3], 1e-6);
    }
  });

  test('실근이 하나뿐이면 그 근만 반환한다', () => {
    expectRootsNear(solveCubic(1, 0, 1, 1), [-0.6823278038280194], 1e-12);
    for (const scale of [1e-14, 1e8]) {
      expectRootsNear(solveCubic(scale, 0, scale, scale), [-0.6823278038280194], 1e-12);
    }
  });

  test('b, c, d가 모두 0이면 0 하나를 반환한다', () => {
    // 중근 분기가 shift = -A/3에서 -0을 만들 수 있어 값으로 비교한다.
    expectRootsNear(solveCubic(1, 0, 0, 0), [0], 0);
    expectRootsNear(solveCubic(-3, 0, 0, 0), [0], 0);
  });

  test('a가 0이면 2차 방정식으로 푼다', () => {
    expectRootsNear(solveCubic(0, 1, -5, 6), [2, 3], 1e-12);
  });
});

describe('math solver - solveCubic eps 명시 시 기존 절대 판정', () => {
  test('판별식 eps² 기준으로 붙은 세 근을 하나로 합치는 결과가 그대로다', () => {
    // 간격 1e-4 근은 판별식이 1e-18 이하라 eps 1e-9여도 [0.5001] 하나만 남는다.
    expect(solveCubic(...coefficientsOf([0.5, 0.5001, 0.5002]), 1e-9)).toEqual([0.5001]);
    expect(solveCubic(...coefficientsOf([1e-6, 2e-6, 3e-6]), 1e-9)).toEqual([0.0000019999790125065147]);
  });

  test('근 dedupe가 eps 절대값을 쓰는 결과가 그대로다', () => {
    // 근 1, 2, 3에서 eps 2이면 판별식이 4 이하라 중근 분기로 가 [2]만 남는다.
    expect(solveCubic(1, -6, 11, -6, 2)).toEqual([2]);
    // eps 1e-9이면 서로 다른 세 근을 그대로 반환한다.
    expect(solveCubic(1, -6, 11, -6, 1e-9)).toEqual([1, 1.9999999999999998, 3]);
  });

  test('eps가 0이어도 절대 판정을 쓴다', () => {
    expect(solveCubic(1, -6, 11, -6, 0)).toEqual([1, 1.9999999999999998, 3]);
  });

  test('간격 1e-4 근에 작은 eps를 줘도 기존처럼 중근 두 개로 나온다', () => {
    const expected = [0.000099999413303542, 0.000100001173392916];
    expect(solveCubic(...coefficientsOf([0, 1e-4, 2e-4]), 1e-9)).toEqual(expected);
    expect(solveCubic(...coefficientsOf([0, 1e-4, 2e-4]), 1e-12)).toEqual(expected);
  });

  test('실근 하나인 경우 결과가 그대로다', () => {
    expect(solveCubic(1, 0, 1, 1, 1e-9)).toEqual([-0.6823278038280194]);
  });
});
