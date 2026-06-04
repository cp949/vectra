/**
 * medial triangle helper를 검증한다.
 * midpoint 계산, degenerate input, aliasing, allocating companion을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { medialTriangle } from '../../../src/triangle/medial-triangle';
import { medialTriangleInto } from '../../../src/triangle/medial-triangle-into';
import { triangleFrom } from '../../../src/triangle/triangle-from';

describe('medialTriangleInto', () => {
  test('세 side의 midpoint를 vertex로 하는 medial triangle을 out에 기록하고 out을 반환한다', () => {
    const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    const out = createTriangle();
    const result = medialTriangleInto(out, triangle);
    expect(result).toBe(out);
    // out.a = midpoint(a, b) = (2, 0)
    // out.b = midpoint(b, c) = (2, 2)
    // out.c = midpoint(c, a) = (0, 2)
    expect(out).toEqual({
      a: { x: 2, y: 0 },
      b: { x: 2, y: 2 },
      c: { x: 0, y: 2 },
    });
  });

  test('collinear triangle에서도 midpoint를 계산한다', () => {
    const triangle = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };
    const out = createTriangle();
    medialTriangleInto(out, triangle);
    expect(out).toEqual({
      a: { x: 1, y: 0 },
      b: { x: 3, y: 0 },
      c: { x: 2, y: 0 },
    });
  });

  test('aliasing: out이 input triangle과 같은 object여도 안전하다', () => {
    const out = triangleFrom({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 });
    medialTriangleInto(out, out);
    expect(out).toEqual({
      a: { x: 2, y: 0 },
      b: { x: 2, y: 2 },
      c: { x: 0, y: 2 },
    });
  });

  test('TriangleTuple input도 처리한다', () => {
    const tup = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const out = createTriangle();
    medialTriangleInto(out, tup);
    expect(out).toEqual({
      a: { x: 2, y: 0 },
      b: { x: 2, y: 2 },
      c: { x: 0, y: 2 },
    });
  });
});

describe('medialTriangle', () => {
  test('medialTriangleInto의 allocating companion: 새 TriangleWritable을 반환한다', () => {
    const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };
    const result = medialTriangle(triangle);
    expect(result).toEqual({
      a: { x: 2, y: 0 },
      b: { x: 2, y: 2 },
      c: { x: 0, y: 2 },
    });
    expect(result).not.toBe(triangle);
  });
});
