/**
 * shape-pair 교점 collection Into policy 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { circleRectIntersectionsInto } from '../../../src/intersects/circle-rect-intersections-into';
import { segmentCircleIntersectionsInto } from '../../../src/intersects/segment-circle-intersections-into';
import { triangleTriangleIntersectionsInto } from '../../../src/intersects/triangle-triangle-intersections-into';
import type { PointWritable } from '../../../src/types';

function expectPointClose(p: PointWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('Into out array clear/reference 보존 (S10-RM-007)', () => {
  test('circleRectIntersectionsInto는 stale 항목을 비우고 같은 reference를 반환한다', () => {
    const out: PointWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    const result = circleRectIntersectionsInto(
      out,
      { cx: 0, cy: 5, r: 3 },
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
    const out: PointWritable[] = [{ x: 1, y: 1 }];
    const result = triangleTriangleIntersectionsInto(
      out,
      { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 },
      { x1: 1, y1: 1, x2: 2, y2: 1, x3: 1, y3: 2 }
    );
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('segmentCircleIntersectionsInto는 매 호출 새 point object를 push한다', () => {
    const out: PointWritable[] = [];
    const seg = { x1: -10, y1: 0, x2: 10, y2: 0 };
    const circle = { cx: 0, cy: 0, r: 5 };
    const first = segmentCircleIntersectionsInto(out, seg, circle)[0];
    const second = segmentCircleIntersectionsInto([], seg, circle)[0];
    expect(first).not.toBe(second);
    expectPointClose(first, -5, 0);
  });
});
