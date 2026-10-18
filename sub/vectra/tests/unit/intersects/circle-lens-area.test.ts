/**
 * circle-circle lens area scalar helper 단위 테스트.
 *
 * S11-RM-026: circleLensArea의 disjoint / external·internal tangent / containment /
 * coincident / proper lens / non-finite·non-positive radius / tuple input을 검증한다.
 * 분기 분류는 circleCircleAreaOverlapDetail(none/touch/overlap/contains)과 일치한다.
 */

import { describe, expect, test } from 'vitest';
import { circleLensArea } from '../../../src/intersects/circle-lens-area';
import type { CircleLike } from '../../../src/types';

const circle = (cx: number, cy: number, radius: number): CircleLike => ({ center: { x: cx, y: cy }, radius });

describe('circleLensArea', () => {
  test('disjoint circles는 0이다', () => {
    expect(circleLensArea(circle(0, 0, 1), circle(10, 0, 1))).toBe(0);
  });

  test('external tangent는 0이다', () => {
    expect(circleLensArea(circle(0, 0, 2), circle(5, 0, 3))).toBe(0);
  });

  test('internal tangent는 작은 disk area다', () => {
    // d = |r1 - r2| = 2. 작은 원(r=3)이 큰 원(r=5) 경계에 한 점으로 닿지만 완전히 포함된다.
    // 교집합은 경계 한 점이 아니라 작은 disk 전체다.
    expect(circleLensArea(circle(0, 0, 5), circle(2, 0, 3))).toBeCloseTo(Math.PI * 9, 12);
  });

  test('internal tangent는 containment·proper lens와 연속이다', () => {
    // d = diff(2)에서 작은 disk area, d를 살짝 넘기면 proper lens가 같은 값으로 수렴한다.
    const exact = circleLensArea(circle(0, 0, 5), circle(2, 0, 3));
    const justInside = circleLensArea(circle(0, 0, 5), circle(2 - 1e-9, 0, 3));
    const justOutside = circleLensArea(circle(0, 0, 5), circle(2 + 1e-9, 0, 3));
    expect(exact).toBeCloseTo(Math.PI * 9, 12);
    expect(justInside).toBeCloseTo(Math.PI * 9, 12);
    expect(justOutside).toBeCloseTo(Math.PI * 9, 6);
  });

  test('내접 경계 근처 large-radius 입력도 NaN 없이 작은 disk area로 수렴한다', () => {
    // 옛 acos 공식에서 인자가 반올림으로 1을 살짝 넘겨 NaN이 나오던 회귀다.
    const ra = 840.546718504574;
    const rb = 948.7338215087397;
    const d = 108.18710300416572; // diff보다 ~2.8e-14 큼 → proper lens 분기
    const area = circleLensArea(circle(0, 0, ra), circle(d, 0, rb));
    expect(Number.isFinite(area)).toBe(true);
    expect(area).toBeCloseTo(Math.PI * ra * ra, 4);
  });

  test('strict containment는 작은 disk area다', () => {
    // 작은 원(r=2)이 큰 원(r=5) 안에 완전히 들어간다.
    expect(circleLensArea(circle(0, 0, 5), circle(1, 0, 2))).toBeCloseTo(Math.PI * 4, 12);
  });

  test('concentric 다른 반지름은 작은 disk area다', () => {
    expect(circleLensArea(circle(0, 0, 5), circle(0, 0, 3))).toBeCloseTo(Math.PI * 9, 12);
  });

  test('coincident equal circles는 full circle area다', () => {
    expect(circleLensArea(circle(2, 3, 4), circle(2, 3, 4))).toBeCloseTo(Math.PI * 16, 12);
  });

  test('proper lens(단위원 거리 1)는 2π/3 - √3/2다', () => {
    const expected = (2 * Math.PI) / 3 - Math.sqrt(3) / 2;
    expect(circleLensArea(circle(0, 0, 1), circle(1, 0, 1))).toBeCloseTo(expected, 12);
  });

  test('proper lens는 작은 disk area보다 작고 양수다', () => {
    const area = circleLensArea(circle(0, 0, 3), circle(3, 0, 2));
    expect(area).toBeGreaterThan(0);
    expect(area).toBeLessThan(Math.PI * 4);
  });

  test('내접 경계 바로 바깥의 lens 면적은 작은 disk area로 수렴한다', () => {
    // d는 |ra - rb|보다 몇 ulp 큰 값이다. 옛 acos 공식의 인자 (d² + ra² - rb²) / (2·d·ra)가 -1.0000000000000064로 계산됐다.
    const small = circle(0, 0, 32.05073752276599);
    const large = circle(0.19114182796329263, 0, 32.241879350729285);
    const area = circleLensArea(small, large);
    expect(Number.isNaN(area)).toBe(false);
    expect(area / (Math.PI * 32.05073752276599 ** 2)).toBeCloseTo(1, 12);
  });

  test.each([
    { name: '반지름비 2', big: 1, small: 0.5 },
    { name: '반지름비 1000', big: 1, small: 1e-3 },
    { name: '반지름비 1e5', big: 1e5, small: 1 },
    { name: '반지름 규모 1e-3', big: 2e-3, small: 1e-3 },
  ])(
    '내접 경계에서 거리 차 1e-12 이내 lens 면적은 작은 disk area와 상대 1e-12 안에서 같다 ($name)',
    ({ big, small }) => {
      // d = big - small + 1e-12·small이다. 떨어진 조각의 면적은 d 차이의 1.5제곱에 비례해 1e-18 규모라
      // 작은 disk area와 double 정밀도에서 같다. acos 기반 공식은 인자 1 근처에서 정밀도가 절반으로 줄어
      // 상대 오차가 1e-8 규모였다.
      const d = big - small + small * 1e-12;
      const expected = Math.PI * small * small;
      expect(circleLensArea(circle(0, 0, big), circle(d, 0, small)) / expected).toBeCloseTo(1, 12);
      expect(circleLensArea(circle(0, 0, small), circle(d, 0, big)) / expected).toBeCloseTo(1, 12);
    }
  );

  test.each([
    { name: '반지름비 1000, 중심 거리 큰 반지름', a: [1, 0], b: [1e-3, 1], expected: 1.5704629934532299e-6 },
    { name: '반지름비 1e6, 중심 거리 큰 반지름', a: [1e3, 0], b: [1e-3, 1e3], expected: 1.5707959934615633e-6 },
    { name: '외접 직전 얇은 lens', a: [3, 0], b: [2, 4.999999999], expected: 6.5319734578799657e-14 },
    { name: '내접 직전 반지름비 1000', a: [1, 0], b: [1e-3, 0.9990000001], expected: 3.1415926535301351e-6 },
  ])(
    '반지름비가 크거나 경계에 가까운 lens 면적은 80자리 계산값과 상대 1e-12 안에서 같다 ($name)',
    ({ a, b, expected }) => {
      // expected는 같은 입력을 80자리 십진수로 계산한 값이다. 표준 공식(acos와 kite 뺄셈)은 이 입력들에서
      // 큰 항끼리 상쇄해 상대 오차가 1e-3에서 1e14까지 커졌다.
      const [ra, ax] = a;
      const [rb, bx] = b;
      expect(circleLensArea(circle(ax, 0, ra), circle(bx, 0, rb)) / expected).toBeCloseTo(1, 12);
      expect(circleLensArea(circle(bx, 0, rb), circle(ax, 0, ra)) / expected).toBeCloseTo(1, 12);
    }
  );

  test('큰 쪽이 첫 번째 인자여도 같은 경계에서 작은 disk area로 수렴한다', () => {
    // 옛 acos 공식에서 beta 쪽 인자가 -1.0000000000000004로 계산되던 배치다.
    const large = circle(0, 0, 61.37142942123115);
    const small = circle(4.447257355786861, 0, 56.92417206544429);
    const area = circleLensArea(large, small);
    expect(Number.isNaN(area)).toBe(false);
    expect(area / (Math.PI * 56.92417206544429 ** 2)).toBeCloseTo(1, 12);
  });

  test('반지름이 같고 중심 거리가 반지름의 1e-308배보다 작아도 면적은 원 하나의 면적이다', () => {
    // 비 f1 / f2가 Infinity로 넘치는 배치다. 비를 그대로 곱하면 NaN이나 2배 면적이 나왔다.
    expect(circleLensArea(circle(0, 0, 1), circle(5e-324, 0, 1)) / Math.PI).toBeCloseTo(1, 12);
    expect(circleLensArea(circle(0, 0, 1), circle(1e-310, 0, 1)) / Math.PI).toBeCloseTo(1, 12);
    expect(circleLensArea(circle(0, 0, 1e20), circle(1e-305, 0, 1e20)) / (Math.PI * 1e40)).toBeCloseTo(1, 12);
  });

  test('반지름이 1e154를 넘어도 면적이 유한하면 유한한 값을 반환한다', () => {
    // expected는 120자리 십진수 계산값이다. r²을 먼저 구하면 Infinity가 나왔다.
    const area = circleLensArea(circle(0, 0, 1e155), circle(1.99e155, 0, 1e155));
    expect(area / 1.332332886470164e307).toBeCloseTo(1, 12);
  });

  test('radius <= 0은 0이다', () => {
    expect(circleLensArea(circle(0, 0, 0), circle(0, 0, 3))).toBe(0);
    expect(circleLensArea(circle(0, 0, -1), circle(0, 0, 3))).toBe(0);
  });

  test('non-finite center/radius는 0이다', () => {
    expect(circleLensArea(circle(Number.NaN, 0, 2), circle(1, 0, 2))).toBe(0);
    expect(circleLensArea(circle(0, 0, Number.POSITIVE_INFINITY), circle(1, 0, 2))).toBe(0);
    expect(circleLensArea(circle(Number.NEGATIVE_INFINITY, 0, 2), circle(1, 0, 2))).toBe(0);
    expect(circleLensArea(circle(0, 0, Number.NEGATIVE_INFINITY), circle(1, 0, 2))).toBe(0);
  });

  test('tuple shorthand circle input을 지원한다', () => {
    const expected = (2 * Math.PI) / 3 - Math.sqrt(3) / 2;
    expect(circleLensArea([[0, 0], 1], [[1, 0], 1])).toBeCloseTo(expected, 12);
  });
});
