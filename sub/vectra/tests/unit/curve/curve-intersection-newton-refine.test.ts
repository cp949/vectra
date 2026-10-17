/**
 * curve × curve 교차 정밀도 회귀 테스트.
 *
 * subdivision이 maxDepth(기본 32)에서 멈춰도 교차 parameter가 Newton refinement로 1e-9 수준까지 정밀해지는지 고정한다.
 * - quadratic×quadratic, quadratic×cubic, cubic×cubic, cubic self 각 1건씩 기준 근과 비교한다.
 * - 내부 접선 접촉(touch)은 Jacobian이 특이하므로 refinement를 건너뛰고 기존 판정을 유지하는지 확인한다.
 * - 끝점에서 접선이 평행하게 만나는 교차는 Newton 대신 끝점 parameter(0, 1)로 snap해 정확한 값을 얻는지 확인한다.
 * - 거의 평행한 두 곡선은 AABB가 maxDepth까지 겹친다. fat line 검사로 근 주변 중복 hit와 근 없는 hit가 사라지는지 확인한다.
 *
 * 기준 근은 원본 control point에서 double Newton을 60회 돌려 얻은 값이다.
 */

import { describe, expect, test } from 'vitest';
import { cubicCubicIntersectionsInto } from '../../../src/curve/cubic-cubic-intersections-into';
import { cubicSelfIntersectionsInto } from '../../../src/curve/cubic-self-intersections-into';
import { cubicSplit } from '../../../src/curve/cubic-split';
import { quadraticCubicIntersectionsInto } from '../../../src/curve/quadratic-cubic-intersections-into';
import { quadraticElevateToCubic } from '../../../src/curve/quadratic-elevate-to-cubic';
import { quadraticQuadraticIntersectionsInto } from '../../../src/curve/quadratic-quadratic-intersections-into';
import type { IntersectionHit, XYObjectWritable } from '../../../src/types';

const TOL = 1e-9;

/**
 * hit를 tA 오름차순으로 정렬한 사본을 반환한다.
 * subdivision 방문 순서에 기대지 않고 근 순서를 고정한다.
 */
function sortByTA(hits: readonly IntersectionHit[]): IntersectionHit[] {
  return [...hits].sort((a, b) => a.tA - b.tA);
}

/**
 * 점을 center 기준으로 degrees만큼 회전한 좌표를 반환한다.
 * 곡선 위 한 점을 중심으로 돌린 복사본은 그 점에서 원본과 얕은 각도로 교차한다.
 */
function rotateAbout(point: XYObjectWritable, center: XYObjectWritable, degrees: number): XYObjectWritable {
  const theta = (degrees * Math.PI) / 180;
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * Math.cos(theta) - dy * Math.sin(theta),
    y: center.y + dx * Math.sin(theta) + dy * Math.cos(theta),
  };
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

describe('접선이 평행한 끝점 교차는 끝점 parameter로 snap한다', () => {
  test('한 cubic을 나눈 두 반쪽은 공유 끝점 hit 1건을 정확한 값으로 기록한다', () => {
    // 나눈 점에서 두 반쪽의 접선은 평행(G1)하다
    const { left, right } = cubicSplit({ x: 0, y: 0 }, { x: 30, y: 80 }, { x: 70, y: 80 }, { x: 100, y: 0 }, 0.4);
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(hits, left.p0, left.p1, left.p2, left.p3, right.p0, right.p1, right.p2, right.p3);

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBe(1);
    expect(hits[0].tB).toBe(0);
    expect(hits[0].point.x).toBeCloseTo(left.p3.x, 12);
    expect(hits[0].point.y).toBeCloseTo(left.p3.y, 12);
  });

  test('quadratic의 끝점에 이어 붙은 cubic은 끝점 hit 1건을 정확한 값으로 기록한다', () => {
    // y = x² 위에서 quadratic은 x∈[0,2], cubic은 x∈[2,3]이다
    const cubic = quadraticElevateToCubic({ x: 2, y: 4 }, { x: 2.5, y: 6 }, { x: 3, y: 9 });
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 4 },
      cubic.p0,
      cubic.p1,
      cubic.p2,
      cubic.p3
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBe(1);
    expect(hits[0].tB).toBe(0);
    expect(hits[0].point.x).toBeCloseTo(2, 12);
    expect(hits[0].point.y).toBeCloseTo(4, 12);
  });

  test('한 곡선의 끝점이 다른 곡선 내부에 접선으로 닿으면 내부 parameter도 정밀해진다', () => {
    // A는 (0,50)에서 (50,50)까지 수평 선분이다. B parabola의 꼭짓점 (50,50)에서 수평 접선으로 닿는다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 50 },
      { x: 25, y: 50 },
      { x: 50, y: 50 },
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 }
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('touch');
    expect(hits[0].tA).toBe(1);
    expect(Math.abs(hits[0].tB - 0.5)).toBeLessThan(TOL);
    expect(hits[0].point.x).toBeCloseTo(50, 9);
    expect(hits[0].point.y).toBeCloseTo(50, 9);
  });

  test('얕은 각도로 내부에 닿는 끝점 hit는 kind를 cross로 유지한다', () => {
    // A 끝점이 cubic B 위 한 점이다. 접선 사이각은 약 0.6°(sin 1.1e-2)라 touch 임계값(2e-3)보다 크다.
    // 근 주변 stray box의 midpoint tangent는 touch로 판정되므로, 끝점 hit의 kind를 정한 parameter에서 계산해야 한다.
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(
      hits,
      { x: 20.822316012345254, y: 89.16724626906216 },
      { x: 34.20280797872692, y: 52.55758771672845 },
      { x: 48.184252660958315, y: 65.3337527967945 },
      { x: 71.96688149124384, y: 97.02100993599743 },
      { x: 20.170513400807977, y: 47.42527718190104 },
      { x: 83.10800110921264, y: 69.15310944896191 },
      { x: 3.112330613657832, y: 75.72149608749896 }
    );

    const endHits = hits.filter((hit) => hit.tA === 1);
    expect(endHits).toHaveLength(1);
    expect(endHits[0].kind).toBe('cross');
    expect(endHits[0].point.x).toBeCloseTo(48.184252660958315, 12);
    expect(endHits[0].point.y).toBeCloseTo(65.3337527967945, 12);
  });

  test('끝점 근처 transversal 교차는 snap하지 않고 Newton 값을 유지한다', () => {
    // A 끝점 (100,0)에서 1e-6 떨어진 곳을 B가 가로지른다. 거리가 epsilon(1e-9)보다 커서 끝점이 아니다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 99.999999, y: -50 },
      { x: 99.999999, y: 0 },
      { x: 99.999999, y: 50 }
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBeLessThan(1);
    expect(hits[0].tA).toBeCloseTo(0.99999999, 9);
    expect(hits[0].tB).toBeCloseTo(0.5, 9);
  });
});

describe('거의 평행한 두 곡선은 maxDepth box를 hit로 남기지 않는다', () => {
  // parabola를 t=0.3 위의 점 (30, 42)를 중심으로 0.2° 돌린 복사본. 두 곡선은 t=u=0.3에서만 만난다.
  const PARABOLA = [
    { x: 0, y: 0 },
    { x: 50, y: 100 },
    { x: 100, y: 0 },
  ];
  const CENTER = { x: 30, y: 42 };
  const ROTATED = PARABOLA.map((point) => rotateAbout(point, CENTER, 0.2));

  test('0.2° 회전한 parabola와의 quadratic × quadratic 교차는 hit 1건이다', () => {
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      PARABOLA[0],
      PARABOLA[1],
      PARABOLA[2],
      ROTATED[0],
      ROTATED[1],
      ROTATED[2]
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBeCloseTo(0.3, 9);
    expect(hits[0].tB).toBeCloseTo(0.3, 9);
    expect(hits[0].point.x).toBeCloseTo(30, 7);
    expect(hits[0].point.y).toBeCloseTo(42, 7);
  });

  test('0.2° 회전한 차수 올림 cubic과의 quadratic × cubic 교차는 hit 1건이다', () => {
    const cubic = quadraticElevateToCubic(PARABOLA[0], PARABOLA[1], PARABOLA[2]);
    const [q0, q1, q2, q3] = [cubic.p0, cubic.p1, cubic.p2, cubic.p3].map((point) => rotateAbout(point, CENTER, 0.2));
    const hits: IntersectionHit[] = [];
    quadraticCubicIntersectionsInto(hits, PARABOLA[0], PARABOLA[1], PARABOLA[2], q0, q1, q2, q3);

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBeCloseTo(0.3, 9);
    expect(hits[0].tB).toBeCloseTo(0.3, 9);
  });

  test('거의 평행하게 교차하는 cubic × cubic은 hit 1건이다', () => {
    // B는 A의 양 끝만 y로 ∓0.01 옮겼다. 차이 y = 0.01·(t³ - (1-t)³)이라 t=u=0.5에서만 만난다.
    const hits: IntersectionHit[] = [];
    cubicCubicIntersectionsInto(
      hits,
      { x: 0, y: 0 },
      { x: 30, y: 2 },
      { x: 70, y: -1 },
      { x: 100, y: 0 },
      { x: 0, y: -0.01 },
      { x: 30, y: 2 },
      { x: 70, y: -1 },
      { x: 100, y: 0.01 }
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].tA).toBeCloseTo(0.5, 9);
    expect(hits[0].tB).toBeCloseTo(0.5, 9);
  });

  test('1e-4 간격으로 나란히 지나가는 두 parabola는 만나지 않으므로 hit가 없다', () => {
    // B는 A를 y로 1e-4 올린 복사본이다. 어디서도 만나지 않는다.
    const hits: IntersectionHit[] = [];
    quadraticQuadraticIntersectionsInto(
      hits,
      PARABOLA[0],
      PARABOLA[1],
      PARABOLA[2],
      { x: 0, y: 1e-4 },
      { x: 50, y: 100 + 1e-4 },
      { x: 100, y: 1e-4 }
    );

    expect(hits).toHaveLength(0);
  });
});
