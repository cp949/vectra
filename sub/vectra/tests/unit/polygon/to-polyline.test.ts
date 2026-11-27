/** 다각형 계산과 출력 계약을 검증한다. */
import type { PointWritable } from '../../../src/types/flat-shapes.internal';
/**
 * polygon toPolyline* bridge helper unit test.
 */

import { describe, expect, test } from 'vitest';
import { toPolyline } from '../../../src/polygon/to-polyline';
import { toPolylineInto } from '../../../src/polygon/to-polyline-into';
import { SQUARE, TRIANGLE } from './_bridge-adapter-test-helpers';

describe('polygon bridge - toPolylineInto', () => {
  test('빈 polygon이면 clear된 빈 배열을 반환한다', () => {
    const out: PointWritable[] = [{ x: 9, y: 9 }];
    const result = toPolylineInto(out, []);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('기존 out contents가 clear된다', () => {
    const out: PointWritable[] = [
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
    const out: PointWritable[] = [];
    toPolylineInto(out, SQUARE);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  test('close=true이면 첫 vertex 복사본을 끝에 추가한다', () => {
    const out: PointWritable[] = [];
    toPolylineInto(out, TRIANGLE, { close: true });
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 },
      { x: 0, y: 0 },
    ]);
  });

  test('close=true이고 single point면 첫 vertex를 복제한다', () => {
    const out: PointWritable[] = [];
    toPolylineInto(out, [5, 7], { close: true });
    expect(out).toEqual([
      { x: 5, y: 7 },
      { x: 5, y: 7 },
    ]);
  });

  test('close=true이고 빈 polygon이면 빈 배열이다', () => {
    const out: PointWritable[] = [];
    toPolylineInto(out, [], { close: true });
    expect(out).toHaveLength(0);
  });

  test('companion이 Into 결과와 deep equal이다', () => {
    const out: PointWritable[] = [];
    toPolylineInto(out, SQUARE, { close: true });
    expect(toPolyline(SQUARE, { close: true })).toEqual(out);
  });
});
