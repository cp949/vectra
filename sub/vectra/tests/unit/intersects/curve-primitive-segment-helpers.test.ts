/**
 * curve-primitive-segment.internal segment/containment kernel characterization 테스트.
 *
 * curveOverlapsSegment / curveContainsPoint / curveCrossesSegment를 .internal에서 직접 import해
 * 현재 numeric 동작을 boolean golden으로 고정한다(분할 후 회귀 net). curveCrossesSegment는
 * CurveLineProbe를 받으므로 curve-primitive-probe.internal의 makeQuadraticProbe로 실제 probe를 만든다.
 *
 * 분기:
 *  - curveOverlapsSegment: collinear range 겹침 → true / perpendicular crossCoef > epsilon*length → false
 *    / zero-length segment(length ≤ epsilon) → curveContainsPoint 위임
 *  - curveContainsPoint: power-basis root에서 dx²+dy² ≤ epsilon² → true / 점이 curve 밖 → false
 *  - curveCrossesSegment: probe hit가 segment range [0,1] 안 → true / range 밖 hit만 → false
 */
import { describe, expect, test } from 'vitest';
import { makeQuadraticProbe } from '../../../src/intersects/curve-primitive-probe.internal';
import {
  curveContainsPoint,
  curveCrossesSegment,
  curveOverlapsSegment,
} from '../../../src/intersects/curve-primitive-segment.internal';
import type { IntersectionHit, XYInput } from '../../../src/types';

const EPS = 1e-9;

// 수평 직선 quadratic: x(t) = -2 + 4t, y(t) = 0. p0(-2,0), p1(0,0), p2(2,0).
const flatX = [-2, 4, 0];
const flatY = [0, 0, 0];

describe('curveOverlapsSegment', () => {
  test('curve가 segment와 collinear하고 range가 겹치면 true', () => {
    // y=0 직선 위 segment (-1,0)→(1,0): flat curve와 동일 직선 + range 겹침
    expect(curveOverlapsSegment(flatX, flatY, -1, 0, 1, 0, EPS)).toBe(true);
  });

  test('segment가 curve 직선에서 perpendicular로 벗어나면(crossCoef > epsilon*length) false', () => {
    // 수직 segment (0,1)→(0,3): flat curve(y=0) 직선과 collinear 아님
    expect(curveOverlapsSegment(flatX, flatY, 0, 1, 0, 3, EPS)).toBe(false);
  });

  test('zero-length segment(length ≤ epsilon)이고 점이 curve 위면 true (curveContainsPoint 위임)', () => {
    // 점 (0,0)은 flat curve 위(t=0.5). zero-length로 containment 위임 경로.
    expect(curveOverlapsSegment(flatX, flatY, 0, 0, 0, 0, EPS)).toBe(true);
  });
});

describe('curveContainsPoint', () => {
  test('점이 power-basis curve 위(root에서 dx²+dy² ≤ epsilon²)면 true', () => {
    expect(curveContainsPoint(flatX, flatY, 0, 0, EPS)).toBe(true);
  });

  test('점이 curve 밖이면 false', () => {
    expect(curveContainsPoint(flatX, flatY, 0, 5, EPS)).toBe(false);
  });
});

describe('curveCrossesSegment', () => {
  // S자 quadratic arc: 양 끝 (-2,-2),(2,-2), t=0.5에서 peak (0,0)을 지난다.
  const aP0: XYInput = { x: -2, y: -2 };
  const aP1: XYInput = { x: 0, y: 2 };
  const aP2: XYInput = { x: 2, y: -2 };

  test('curve가 segment range 안에서 교차하면 true', () => {
    const probe = makeQuadraticProbe(aP0, aP1, aP2, EPS);
    const hits: IntersectionHit[] = [];
    // segment (-2,0)→(2,0): arc가 y=0을 두 번 가로지른다.
    expect(curveCrossesSegment(probe, hits, -2, 0, 2, 0)).toBe(true);
  });

  test('curve가 segment range 밖에서만 교차하면 false', () => {
    const probe = makeQuadraticProbe(aP0, aP1, aP2, EPS);
    const hits: IntersectionHit[] = [];
    // segment (10,0)→(12,0): arc 직선상 교점이 segment parameter range [0,1] 밖.
    expect(curveCrossesSegment(probe, hits, 10, 0, 12, 0)).toBe(false);
  });
});
