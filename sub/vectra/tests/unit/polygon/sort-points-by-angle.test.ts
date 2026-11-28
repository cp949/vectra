/**
 * polygon sortPointsByAngle* adapter helper unit test.
 */

import type { Polygon } from '../../../src/types/flat-shapes.internal';
import { describe, expect, test } from 'vitest';
import { sortPointsByAngle } from '../../../src/polygon/sort-points-by-angle';
import { sortPointsByAngleInto } from '../../../src/polygon/sort-points-by-angle-into';

describe('polygon bridge - sortPointsByAngleInto', () => {
  test('빈 point set이면 clear된 빈 배열을 반환한다', () => {
    const out: number[] = [9, 9];
    const result = sortPointsByAngleInto(out, []);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single point는 그대로 반환한다', () => {
    const out: number[] = [];
    sortPointsByAngleInto(out, [5, 7]);
    expect(out).toEqual([5, 7]);
  });

  test('explicit center 기준 atan2 오름차순으로 정렬한다', () => {
    const poly: Polygon = [1, 0, 0, 1, -1, 0, 0, -1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([0, -1, 1, 0, 0, 1, -1, 0]);
  });

  test('기본 center는 arithmetic mean이다', () => {
    // mean of square corners = (0,0)
    const poly: Polygon = [1, 1, -1, 1, -1, -1, 1, -1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly);
    expect(out).toEqual([-1, -1, 1, -1, 1, 1, -1, 1]);
  });

  test('같은 angle은 center로부터 가까운 point가 먼저다', () => {
    const poly: Polygon = [2, 0, 1, 0];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([1, 0, 2, 0]);
  });

  test('duplicate point는 모두 유지하고 원래 순서로 둔다', () => {
    const poly: Polygon = [1, 1, 1, 1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([1, 1, 1, 1]);
  });

  test('center와 일치하는 point는 angle 0, distSq 0으로 처리한다', () => {
    const poly: Polygon = [1, 0, 0, 0];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([0, 0, 1, 0]);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const shared: number[] = [1, 0, 0, 1, -1, 0, 0, -1];
    sortPointsByAngleInto(shared, shared, { center: { x: 0, y: 0 } });
    expect(shared).toEqual([0, -1, 1, 0, 0, 1, -1, 0]);
  });

  test('explicit center에서 non-finite point는 finite-angle point 뒤에 원래 순서로 둔다', () => {
    const poly: Polygon = [Number.NaN, 0, 1, 0, 0, 1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([1, 0, 0, 1, Number.NaN, 0]);
  });

  test('기본 center에서 non-finite point가 있으면 원래 순서를 보존한다', () => {
    const poly: Polygon = [1, 0, Number.NaN, 5, 0, 1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly);
    expect(out).toEqual([1, 0, Number.NaN, 5, 0, 1]);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const poly: Polygon = [1, 1, -1, 1, -1, -1, 1, -1];
    const out: number[] = [];
    sortPointsByAngleInto(out, poly);
    expect(sortPointsByAngle(poly)).toEqual(out);
  });
});
