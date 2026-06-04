/**
 * polygon pointsAlongEdges* bridge helper unit test.
 */

import { describe, expect, test } from 'vitest';
import { pointsAlongEdges } from '../../../src/polygon/points-along-edges';
import { pointsAlongEdgesInto } from '../../../src/polygon/points-along-edges-into';
import type { PolygonLike, XYObjectWritable } from '../../../src/types';
import { SQUARE } from './_bridge-adapter-test-helpers';

describe('polygon bridge - pointsAlongEdgesInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = pointsAlongEdgesInto(out, { points: [] }, 1);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('single point polygon은 시작점 1개만 반환한다', () => {
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, { points: [{ x: 5, y: 7 }] }, 1);
    expect(out).toEqual([{ x: 5, y: 7 }]);
  });

  test('repeated-point polygon(perimeter 0)은 시작점 1개만 반환한다', () => {
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(
      out,
      {
        points: [
          { x: 2, y: 3 },
          { x: 2, y: 3 },
          { x: 2, y: 3 },
        ],
      },
      1
    );
    expect(out).toEqual([{ x: 2, y: 3 }]);
  });

  test('2점 degenerate polygon은 왕복 closed ring(perimeter 2*edge)으로 샘플링한다', () => {
    // (0,0)→(2,0)→(0,0) 왕복. perimeter 4, spacing 1 → 거리 0,1,2,3.
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(
      out,
      {
        points: [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
        ],
      },
      1
    );
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  test('square boundary를 마지막 닫는 edge까지 샘플링한다', () => {
    // perimeter 8, spacing 2 → 0,2,4,6 거리. 마지막 edge(0,2)→(0,0) 샘플(거리 6 → (0,2))을 포함한다.
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, SQUARE, 2);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  test('시작점은 항상 포함하고 끝점(시작점 복제)은 추가하지 않는다', () => {
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, SQUARE, 2);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    // 마지막 sample은 시작점으로 되돌아오지 않는다.
    expect(out[out.length - 1]).not.toEqual({ x: 0, y: 0 });
  });

  test('spacing이 perimeter보다 크면 시작점 1개만 반환한다', () => {
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, SQUARE, 100);
    expect(out).toEqual([{ x: 0, y: 0 }]);
  });

  test('마지막 edge 중간 지점을 샘플링한다', () => {
    // perimeter 8, spacing 3 → 거리 0,3,6. 거리 6은 마지막 edge(0,2)→(0,0) 위 (0,2).
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, SQUARE, 3);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[1]).toEqual({ x: 2, y: 1 });
    expect(out[2]).toEqual({ x: 0, y: 2 });
  });

  test('spacing이 0이면 RangeError를 던진다', () => {
    expect(() => pointsAlongEdgesInto([], SQUARE, 0)).toThrow(RangeError);
  });

  test('spacing이 음수면 RangeError를 던진다', () => {
    expect(() => pointsAlongEdgesInto([], SQUARE, -1)).toThrow(RangeError);
  });

  test('spacing이 non-finite면 RangeError를 던진다', () => {
    expect(() => pointsAlongEdgesInto([], SQUARE, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => pointsAlongEdgesInto([], SQUARE, Number.NaN)).toThrow(RangeError);
  });

  test('non-finite perimeter이면 RangeError를 던진다', () => {
    expect(() =>
      pointsAlongEdgesInto(
        [],
        {
          points: [
            { x: 0, y: 0 },
            { x: Number.POSITIVE_INFINITY, y: 0 },
          ],
        },
        1
      )
    ).toThrow(RangeError);
    expect(() =>
      pointsAlongEdgesInto(
        [],
        {
          points: [
            { x: 0, y: 0 },
            { x: Number.NaN, y: 0 },
          ],
        },
        1
      )
    ).toThrow(RangeError);
  });

  test('tuple point 입력을 처리한다', () => {
    const poly: PolygonLike = {
      points: [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ],
    };
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, poly, 2);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 0, y: 0 };
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, { points: [pt] }, 1);
    expect(out[0]).not.toBe(pt);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const shared: XYObjectWritable[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    pointsAlongEdgesInto(shared, { points: shared }, 2);
    expect(shared).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const out: XYObjectWritable[] = [];
    pointsAlongEdgesInto(out, SQUARE, 1.5);
    expect(pointsAlongEdges(SQUARE, 1.5)).toEqual(out);
  });
});
