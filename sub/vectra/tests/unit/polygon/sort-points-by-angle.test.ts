/**
 * polygon sortPointsByAngle* adapter helper unit test.
 */

import { describe, expect, test } from 'vitest';
import { sortPointsByAngle } from '../../../src/polygon/sort-points-by-angle';
import { sortPointsByAngleInto } from '../../../src/polygon/sort-points-by-angle-into';
import type { PolygonLike, XYObjectWritable } from '../../../src/types';

describe('polygon bridge - sortPointsByAngleInto', () => {
  test('빈 point set이면 clear된 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = sortPointsByAngleInto(out, { points: [] });
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single point는 그대로 반환한다', () => {
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, { points: [{ x: 5, y: 7 }] });
    expect(out).toEqual([{ x: 5, y: 7 }]);
  });

  test('explicit center 기준 atan2 오름차순으로 정렬한다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ]);
  });

  test('기본 center는 arithmetic mean이다', () => {
    // mean of square corners = (0,0)
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly);
    expect(out).toEqual([
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
    ]);
  });

  test('같은 angle은 center로부터 가까운 point가 먼저다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  test('duplicate point는 모두 유지하고 원래 순서로 둔다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  test('center와 일치하는 point는 angle 0, distSq 0으로 처리한다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  test('tuple point 입력을 처리한다', () => {
    const poly: PolygonLike = {
      points: [
        [1, 0],
        [0, -1],
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 0, y: -1 },
      { x: 1, y: 0 },
    ]);
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, { points: [pt] });
    expect(out[0]).not.toBe(pt);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const shared: XYObjectWritable[] = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ];
    sortPointsByAngleInto(shared, { points: shared }, { center: { x: 0, y: 0 } });
    expect(shared).toEqual([
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ]);
  });

  test('explicit center에서 non-finite point는 finite-angle point 뒤에 원래 순서로 둔다', () => {
    const poly: PolygonLike = {
      points: [
        { x: Number.NaN, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly, { center: { x: 0, y: 0 } });
    expect(out).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: Number.NaN, y: 0 },
    ]);
  });

  test('기본 center에서 non-finite point가 있으면 원래 순서를 보존한다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 0 },
        { x: Number.NaN, y: 5 },
        { x: 0, y: 1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly);
    expect(out).toEqual([
      { x: 1, y: 0 },
      { x: Number.NaN, y: 5 },
      { x: 0, y: 1 },
    ]);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const poly: PolygonLike = {
      points: [
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
      ],
    };
    const out: XYObjectWritable[] = [];
    sortPointsByAngleInto(out, poly);
    expect(sortPointsByAngle(poly)).toEqual(out);
  });
});
