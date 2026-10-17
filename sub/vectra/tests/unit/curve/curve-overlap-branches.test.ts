/**
 * findCurveOverlap의 닫힌 curve·왕복 구간 분기 테스트.
 *
 * 검증 항목:
 *  1. 닫힌 curve(P(0) = P(1)) 위의 부분 호도 겹침 구간을 찾는다.
 *  2. 겹침 후보 사이 대응 parameter가 단조가 아니면 겹침으로 보지 않는다.
 *  3. A가 B 위에 놓여도 B의 해당 구간이 A 위에 없으면 겹침으로 보지 않는다.
 *
 * 설계 메모:
 *  - 입력은 부분 호·왕복 곡선을 무작위로 만들어 분기별로 처음 닿은 것을 골랐다.
 *  - 기대값은 현재 동작이다.
 *  - 1번의 별칭 보충 분기(`closedEndpointAliases`)는 변이로 구분되지 않는다. 가짜 별칭 후보는 이후 양방향 sampling이 걸러낸다.
 */
import { describe, expect, test } from 'vitest';
import type { CubicFlat } from '../../../src/curve/curve-intersections.internal';
import { cubicOverlapCurve, findCurveOverlap } from '../../../src/curve/curve-overlap.internal';

const EPSILON = 1e-9;

/** 두 cubic flat 좌표의 겹침 구간을 구한다. */
function overlapOf(a: CubicFlat, b: CubicFlat) {
  return findCurveOverlap(cubicOverlapCurve(a), cubicOverlapCurve(b), EPSILON);
}

describe('닫힌 curve와 겹침', () => {
  test('닫힌 curve의 부분 호를 거꾸로 놓아도 전체 구간이 겹친다', () => {
    // b는 p0 = p3인 닫힌 loop다. a는 b의 t = 0.99에서 0.4까지를 거꾸로 따라간다.
    const a: CubicFlat = [0.5149985, 0.5010395, 0.80991, 0.54172, 1.0996, 1.7642, 1.076, 2.012];
    const b: CubicFlat = [0.5, 0.5, 1.5, 4, 1, 0.5, 0.5, 0.5];
    const overlap = overlapOf(a, b);
    expect(overlap).not.toBeNull();
    expect(overlap?.tA0).toBe(0);
    expect(overlap?.tA1).toBe(1);
    expect(overlap?.tB0).toBeCloseTo(0.99, 6);
    expect(overlap?.tB1).toBeCloseTo(0.4, 6);
  });
});

describe('겹침 후보 검증', () => {
  test('대응 parameter가 단조가 아니면 겹침이 없다', () => {
    // a는 x = 4 직선 위를 내려가고 b는 같은 직선 위를 올라갔다 내려온다.
    const a: CubicFlat = [4, 2.16, 4, 2.04, 4, 1.8, 4, 1.44];
    const b: CubicFlat = [4, 0, 4, 3, 4, 3, 4, 0];
    expect(overlapOf(a, b)).toBeNull();
  });

  test('B의 해당 구간이 A 위에 없으면 겹침이 없다', () => {
    // 두 curve 모두 y = 3 직선 위에 있지만 b가 a의 범위 밖까지 왕복한다.
    const a: CubicFlat = [1.78, 3, 1.98, 3, 2.555, 3, 2.5675, 3];
    const b: CubicFlat = [2.5, 3, 0.5, 3, 3, 3, 2.5, 3];
    expect(overlapOf(a, b)).toBeNull();
  });
});
