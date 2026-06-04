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
    // acos 인자가 반올림으로 1을 살짝 넘겨 NaN이 나오던 회귀. clamp로 막는다.
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
