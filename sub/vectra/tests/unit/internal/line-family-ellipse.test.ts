/**
 * solveLineFamilyEllipse kernel의 분기 경계를 고정하는 characterization test.
 *
 * line-family-ellipse.ts의 세 adapter(lineFamilyEllipseIntersects/IntersectionPoint/
 * IntersectionPoints)는 이미 intersects-ellipse.test.ts / ellipse-intersections.test.ts에서
 * end-to-end golden으로 커버된다(closed-disk-boundary, degenerate, tangent, contained-interior
 * 케이스 포함). 여기서는 세 adapter가 공유하는 solveLineFamilyEllipse 커널 자체의 분기 선택
 * 경계(empty/degenerate/tangent epsilon band 양끝/two-root 정렬)를 직접 고정한다.
 */

import { describe, expect, test } from 'vitest';
import {
  type LineFamilyEllipseSolutionBuffer,
  solveLineFamilyEllipse,
} from '../../../src/internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../../../src/internal/numeric';

describe('solveLineFamilyEllipse', () => {
  test('결과 buffer를 제공하면 같은 object에 two-root 결과를 기록한다', () => {
    const out: LineFamilyEllipseSolutionBuffer = { kind: 'none', inside: false, t: 0, t1: 0, t2: 0 };

    const sol = solveLineFamilyEllipse(0, 0, 1, 0, 0, 0, 2, 1, DEFAULT_EPSILON, out);

    expect(sol).toBe(out);
    expect(sol).toMatchObject({ kind: 'two-root', t1: -2, t2: 2, inside: true });
  });

  test('empty ellipse(rx<=0)는 kind: none이다', () => {
    expect(solveLineFamilyEllipse(-5, 0, 1, 0, 0, 0, 0, 1, DEFAULT_EPSILON)).toEqual({ kind: 'none' });
  });

  test('empty ellipse(ry<=0)는 kind: none이다', () => {
    expect(solveLineFamilyEllipse(-5, 0, 1, 0, 0, 0, 1, 0, DEFAULT_EPSILON)).toEqual({ kind: 'none' });
  });

  test('degenerate direction(dx=dy=0)이 closed disk 안이면 inside: true다', () => {
    // origin이 ellipse 중심 — closed disk 내부
    expect(solveLineFamilyEllipse(0, 0, 0, 0, 0, 0, 2, 1, DEFAULT_EPSILON)).toEqual({
      kind: 'degenerate',
      inside: true,
    });
  });

  test('degenerate direction(dx=dy=0)이 closed disk 밖이면 inside: false다', () => {
    expect(solveLineFamilyEllipse(10, 10, 0, 0, 0, 0, 2, 1, DEFAULT_EPSILON)).toEqual({
      kind: 'degenerate',
      inside: false,
    });
  });

  describe('epsilon band 경계 — 음의 disc', () => {
    // 단위원(rx=ry=1) 기준 U=-1,V=-1,DU=-2,DV=1 → a=5, halfB=1, c=1, disc=-4(정수, 반올림 오차 없음)
    const ox = -1;
    const oy = -1;
    const dx = -2;
    const dy = 1;

    test('disc(-4)가 정확히 -epsilon²(epsilon=2)이면 경계 포함으로 kind: tangent다(none이 아님)', () => {
      const sol = solveLineFamilyEllipse(ox, oy, dx, dy, 0, 0, 1, 1, 2);
      expect(sol.kind).toBe('tangent');
      if (sol.kind === 'tangent') {
        expect(sol.t).toBeCloseTo(-0.2, 12); // t = -halfB/a = -1/5
        expect(sol.inside).toBe(false); // c=1 > 0
      }
    });

    test('disc(-4)가 -epsilon²(epsilon=1.9) 미만이면 kind: none이다', () => {
      const sol = solveLineFamilyEllipse(ox, oy, dx, dy, 0, 0, 1, 1, 1.9);
      expect(sol).toEqual({ kind: 'none' });
    });
  });

  describe('epsilon band 경계 — 양의 disc', () => {
    // 단위원 중심을 지나는 +x 방향 direction — a=1, halfB=0, c=-1, disc=1(정수)
    const ox = 0;
    const oy = 0;
    const dx = 1;
    const dy = 0;

    test('disc(1)가 정확히 +epsilon²(epsilon=1)이면 경계 포함으로 kind: tangent다(two-root가 아님)', () => {
      const sol = solveLineFamilyEllipse(ox, oy, dx, dy, 0, 0, 1, 1, 1);
      expect(sol.kind).toBe('tangent');
      if (sol.kind === 'tangent') {
        expect(sol.t).toBeCloseTo(0, 12);
        expect(sol.inside).toBe(true); // c=-1 <= 0
      }
    });

    test('disc(1)가 +epsilon²(epsilon=0.9) 초과이면 kind: two-root이고 t1<=t2로 정렬된다', () => {
      const sol = solveLineFamilyEllipse(ox, oy, dx, dy, 0, 0, 1, 1, 0.9);
      expect(sol.kind).toBe('two-root');
      if (sol.kind === 'two-root') {
        expect(sol.t1).toBeCloseTo(-1, 12);
        expect(sol.t2).toBeCloseTo(1, 12);
        expect(sol.t1).toBeLessThanOrEqual(sol.t2);
        expect(sol.inside).toBe(true);
      }
    });
  });

  test('실제 tangent(ellipse 위쪽 꼭짓점 접선)에서 t가 접점 좌표를 복원한다', () => {
    // ellipse center(0,0) rx=2 ry=1, y=1 수평선 — 위쪽 꼭짓점(0,1)에서 접한다.
    const sol = solveLineFamilyEllipse(-5, 1, 1, 0, 0, 0, 2, 1, DEFAULT_EPSILON);
    expect(sol.kind).toBe('tangent');
    if (sol.kind === 'tangent') {
      expect(-5 + sol.t * 1).toBeCloseTo(0, 9);
      expect(1 + sol.t * 0).toBeCloseTo(1, 9);
      expect(sol.inside).toBe(false); // origin(-5,1)은 closed disk 밖
    }
  });

  test('중심을 지나는 direction은 two-root이고 inside: true(닫힌 disk 포함)다', () => {
    // ellipse center(0,0) rx=2 ry=1, origin이 중심이고 +x 방향 — (-2,0)/(2,0)에서 교차.
    const sol = solveLineFamilyEllipse(0, 0, 1, 0, 0, 0, 2, 1, DEFAULT_EPSILON);
    expect(sol.kind).toBe('two-root');
    if (sol.kind === 'two-root') {
      expect(sol.t1).toBeCloseTo(-2, 12);
      expect(sol.t2).toBeCloseTo(2, 12);
      expect(sol.inside).toBe(true);
    }
  });
});
