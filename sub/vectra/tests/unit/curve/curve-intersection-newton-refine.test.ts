/**
 * curve × curve 교차 정밀도 회귀 테스트.
 *
 * subdivision이 maxDepth(기본 32)에서 멈춰도 교차 parameter가 Newton refinement로 1e-9 수준까지 정밀해지는지 고정한다.
 * - quadratic×quadratic, quadratic×cubic, cubic×cubic, cubic self 각 1건씩 기준 근과 비교한다.
 * - 접선 접촉(touch)은 Jacobian이 특이하므로 refinement를 건너뛰고 기존 판정을 유지하는지 확인한다.
 *
 * 기준 근은 원본 control point에서 double Newton을 60회 돌려 얻은 값이다.
 */

import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import type { IntersectionHit } from '../../../src/types';

const TOL = 1e-9;

/**
 * hit를 tA 오름차순으로 정렬한 사본을 반환한다.
 * subdivision 방문 순서에 기대지 않고 근 순서를 고정한다.
 */
function sortByTA(hits: readonly IntersectionHit[]): IntersectionHit[] {
  return [...hits].sort((a, b) => a.tA - b.tA);
}

describe('curve × curve 교차 정밀도', () => {
  test('quadratic × quadratic 교차 parameter가 1e-9 이내로 정밀해진다', () => {
    // x=100t, x=100u이므로 두 근은 t=u=(1∓√0.5)/2
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 50 },
      { x: 50, y: -50 },
      { x: 100, y: 50 }
    );

    expect(hits).toHaveLength(2);
    const [first, second] = sortByTA(hits);
    expect(first.tA).toBeCloseTo(0.14644660940672624, 9);
    expect(first.tB).toBeCloseTo(0.14644660940672624, 9);
    expect(first.point.x).toBeCloseTo(14.644660940672624, 7);
    expect(first.point.y).toBeCloseTo(25, 7);
    expect(second.tA).toBeCloseTo(0.8535533905932737, 9);
    expect(second.tB).toBeCloseTo(0.8535533905932737, 9);
    expect(second.point.x).toBeCloseTo(85.35533905932738, 7);
    expect(second.point.y).toBeCloseTo(25, 7);
  });

  test('cubic × cubic 교차 parameter가 1e-9 이내로 정밀해진다', () => {
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 30, y: 80 },
      { x: 70, y: 80 },
      { x: 100, y: 0 },
      { x: 0, y: 60 },
      { x: 30, y: -20 },
      { x: 70, y: -20 },
      { x: 100, y: 60 }
    );

    expect(hits).toHaveLength(2);
    const [first, second] = sortByTA(hits);
    expect(Math.abs(first.tA - 0.14644660940672624)).toBeLessThan(TOL);
    expect(Math.abs(first.tB - 0.14644660940672624)).toBeLessThan(TOL);
    expect(Math.abs(first.point.x - 13.760777464189438)).toBeLessThan(1e-7);
    expect(Math.abs(second.tA - 0.8535533905932737)).toBeLessThan(TOL);
    expect(Math.abs(second.tB - 0.8535533905932737)).toBeLessThan(TOL);
    expect(Math.abs(second.point.x - 86.23922253581055)).toBeLessThan(1e-7);
  });

  test('quadratic × cubic 교차 parameter가 1e-9 이내로 정밀해진다', () => {
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 60 },
      { x: 30, y: -20 },
      { x: 70, y: -20 },
      { x: 100, y: 60 }
    );

    expect(hits).toHaveLength(2);
    const [first, second] = sortByTA(hits);
    expect(Math.abs(first.tA - 0.1578768327593371)).toBeLessThan(TOL);
    expect(Math.abs(first.tB - 0.16714400206042884)).toBeLessThan(TOL);
    expect(Math.abs(first.point.x - 15.787683275933707)).toBeLessThan(1e-7);
    expect(Math.abs(second.tA - 0.8421231672406629)).toBeLessThan(TOL);
    expect(Math.abs(second.tB - 0.8328559979395712)).toBeLessThan(TOL);
    expect(Math.abs(second.point.x - 84.2123167240663)).toBeLessThan(1e-7);
  });

  test('cubic self 교차 parameter가 1e-9 이내로 정밀해진다', () => {
    // loop cubic의 자기 교차점은 (4/7, 6/7)이다
    const hits: IntersectionHit[] = [];
    cubicSelfIntersectionsInto(hits, { x: 0, y: 0 }, { x: 2, y: 2 }, { x: -2, y: 2 }, { x: 2, y: 0 });

    expect(hits).toHaveLength(1);
    expect(Math.abs(hits[0].tA - 0.1726731646460114)).toBeLessThan(TOL);
    expect(Math.abs(hits[0].tB - 0.8273268353539887)).toBeLessThan(TOL);
    expect(Math.abs(hits[0].point.x - 4 / 7)).toBeLessThan(1e-9);
    expect(Math.abs(hits[0].point.y - 6 / 7)).toBeLessThan(1e-9);
  });
});

describe('접선 접촉(touch)은 refinement로 깨지지 않는다', () => {
  test('꼭짓점이 맞닿은 두 parabola는 touch hit 1건을 유지한다', () => {
    // A 꼭짓점 (50,50), B 꼭짓점 (50,50). 접선이 평행해 Jacobian이 특이하다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
      { x: 50, y: 0 },
      { x: 100, y: 100 }
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
    expect(hits[0].tA).toBeCloseTo(0.5, 3);
    expect(hits[0].tB).toBeCloseTo(0.5, 3);
    expect(hits[0].point.x).toBeCloseTo(50, 2);
    expect(hits[0].point.y).toBeCloseTo(50, 2);
  });

  test('꼭짓점이 맞닿은 두 cubic은 touch hit 1건을 유지한다', () => {
    // 두 cubic 모두 (50,60)에서 수평 접선을 가진다
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 30, y: 80 },
      { x: 70, y: 80 },
      { x: 100, y: 0 },
      { x: 0, y: 120 },
      { x: 30, y: 40 },
      { x: 70, y: 40 },
      { x: 100, y: 120 }
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
    expect(hits[0].tA).toBeCloseTo(0.5, 3);
    expect(hits[0].tB).toBeCloseTo(0.5, 3);
    expect(hits[0].point.x).toBeCloseTo(50, 2);
    expect(hits[0].point.y).toBeCloseTo(60, 2);
  });
});
