/**
 * medial triangle helper를 검증한다.
 * midpoint 계산, degenerate input, aliasing, allocating companion을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { medialTriangle } from '../../../src/triangle/medial-triangle';
import { medialTriangleInto } from '../../../src/triangle/medial-triangle-into';

describe('medialTriangleInto', () => {
  test('세 side의 midpoint를 vertex로 하는 medial triangle을 out에 기록하고 out을 반환한다', () => {
    const triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const out = { x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
    const result = medialTriangleInto(out, triangle);
    expect(result).toBe(out);
    // out.a = midpoint(a, b) = (2, 0)
    // out.b = midpoint(b, c) = (2, 2)
    // out.c = midpoint(c, a) = (0, 2)
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: 2, x3: 0, y3: 2 });
  });

  test('collinear triangle에서도 midpoint를 계산한다', () => {
    const triangle = { x1: 0, y1: 0, x2: 2, y2: 0, x3: 4, y3: 0 };
    const out = { x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 };
    medialTriangleInto(out, triangle);
    expect(out).toEqual({ x1: 1, y1: 0, x2: 3, y2: 0, x3: 2, y3: 0 });
  });

  test('aliasing: out이 input triangle과 같은 object여도 안전하다', () => {
    const out = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    medialTriangleInto(out, out);
    expect(out).toEqual({ x1: 2, y1: 0, x2: 2, y2: 2, x3: 0, y3: 2 });
  });
});

describe('medialTriangle', () => {
  test('medialTriangleInto의 allocating companion: 새 TriangleWritable을 반환한다', () => {
    const triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4 };
    const result = medialTriangle(triangle);
    expect(result).toEqual({ x1: 2, y1: 0, x2: 2, y2: 2, x3: 0, y3: 2 });
    expect(result).not.toBe(triangle);
  });
});
