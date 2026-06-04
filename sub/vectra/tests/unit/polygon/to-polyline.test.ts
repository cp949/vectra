/**
 * polygon toPolyline* bridge helper unit test.
 */

import { describe, expect, test } from 'vitest';
import { toPolyline } from '../../../src/polygon/to-polyline';
import { toPolylineInto } from '../../../src/polygon/to-polyline-into';
import type { PolygonLike, XYObjectWritable } from '../../../src/types';
import { SQUARE, TRIANGLE } from './_bridge-adapter-test-helpers';

describe('polygon bridge - toPolylineInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 9, y: 9 }];
    const result = toPolylineInto(out, { points: [] });
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: XYObjectWritable[] = [
      { x: 9, y: 9 },
      { x: 8, y: 8 },
      { x: 7, y: 7 },
    ];
    toPolylineInto(out, TRIANGLE);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
    ]);
  });

  test('기본은 vertex를 순서대로 복사한 open view다', () => {
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, SQUARE);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  test('close=true이면 첫 vertex 복사본을 끝에 추가한다', () => {
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, TRIANGLE, { close: true });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
      { x: 0, y: 0 },
    ]);
  });

  test('close=true이고 single point면 첫 vertex를 복제한다', () => {
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, { points: [{ x: 5, y: 7 }] }, { close: true });
    expect(out).toEqual([
      { x: 5, y: 7 },
      { x: 5, y: 7 },
    ]);
  });

  test('close=true이고 빈 polygon이면 빈 배열이다', () => {
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, { points: [] }, { close: true });
    expect(out).toHaveLength(0);
  });

  test('bare point array 입력을 처리한다', () => {
    const points = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ] as const;
    const out: XYObjectWritable[] = [];
    expect(toPolylineInto(out, points)).toBe(out);
    expect(out).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
  });

  test('tuple point 입력이 새 object point로 출력된다', () => {
    const poly: PolygonLike = {
      points: [
        [1, 2],
        [3, 4],
      ],
    };
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, poly);
    expect(out).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  test('출력된 point object는 input point object와 다른 새 object다', () => {
    const pt = { x: 1, y: 2 };
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, { points: [pt] }, { close: true });
    expect(out[0]).not.toBe(pt);
    expect(out[1]).not.toBe(pt);
    expect(out[1]).not.toBe(out[0]);
  });

  test('input/output 배열 aliasing에서도 결과가 유지된다', () => {
    const shared: XYObjectWritable[] = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];
    toPolylineInto(shared, { points: shared }, { close: true });
    expect(shared).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 2 },
    ]);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const out: XYObjectWritable[] = [];
    toPolylineInto(out, SQUARE, { close: true });
    expect(toPolyline(SQUARE, { close: true })).toEqual(out);
  });
});
