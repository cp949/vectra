/**
 * shape-pair 교점 collection Into policy 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { circleRectIntersectionsInto } from '../../../src/intersects/circle-rect-intersections-into';
import { segmentCircleIntersectionsInto } from '../../../src/intersects/segment-circle-intersections-into';
import { triangleTriangleIntersectionsInto } from '../../../src/intersects/triangle-triangle-intersections-into';
import type { XYObjectWritable } from '../../../src/types';

function expectPointClose(p: XYObjectWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('Into out array clear/reference 보존 (S10-RM-007)', () => {
  test('circleRectIntersectionsInto는 stale 항목을 비우고 같은 reference를 반환한다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    const result = circleRectIntersectionsInto(
      out,
      { center: { x: 0, y: 5 }, radius: 3 },
      {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      }
    );
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expectPointClose(out[0], 0, 8, 6);
    expectPointClose(out[1], 0, 2, 6);
  });

  test('triangleTriangleIntersectionsInto는 빈 결과에서도 out array를 clear한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = triangleTriangleIntersectionsInto(
      out,
      { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } },
      { a: { x: 1, y: 1 }, b: { x: 2, y: 1 }, c: { x: 1, y: 2 } }
    );
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('segmentCircleIntersectionsInto는 매 호출 새 point object를 push한다', () => {
    const out: XYObjectWritable[] = [];
    const seg = { a: { x: -10, y: 0 }, b: { x: 10, y: 0 } };
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const first = segmentCircleIntersectionsInto(out, seg, circle)[0];
    const second = segmentCircleIntersectionsInto([], seg, circle)[0];
    expect(first).not.toBe(second);
    expectPointClose(first, -5, 0);
  });
});
