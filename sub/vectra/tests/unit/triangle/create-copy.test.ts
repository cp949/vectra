/**
 * triangle 생성과 복사 API를 검증한다.
 * createTriangle, triangleFrom overload, copyInto aliasing을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/triangle/copy-into';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { triangleFrom } from '../../../src/triangle/triangle-from';

describe('createTriangle', () => {
  test('인수 없이 호출하면 모든 vertex가 {x:0,y:0}인 빈 triangle을 반환한다', () => {
    const t = createTriangle();
    expect(t).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 0, y: 0 },
      c: { x: 0, y: 0 },
    });
  });
});

describe('triangleFrom overload', () => {
  test('세 XYInput으로 초기화한 triangle을 반환한다', () => {
    const t = triangleFrom({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 });
    expect(t).toEqual({
      a: { x: 1, y: 2 },
      b: { x: 3, y: 4 },
      c: { x: 5, y: 6 },
    });
  });

  test('tuple XYInput으로도 초기화할 수 있다', () => {
    const t = triangleFrom([1, 2] as const, [3, 4] as const, [5, 6] as const);
    expect(t).toEqual({
      a: { x: 1, y: 2 },
      b: { x: 3, y: 4 },
      c: { x: 5, y: 6 },
    });
  });

  test('TriangleLike object로 초기화한 triangle을 반환한다', () => {
    const src = { a: { x: 10, y: 20 }, b: { x: 30, y: 40 }, c: { x: 50, y: 60 } };
    const t = triangleFrom(src);
    expect(t).toEqual({
      a: { x: 10, y: 20 },
      b: { x: 30, y: 40 },
      c: { x: 50, y: 60 },
    });
  });

  test('TriangleTuple로 초기화한 triangle을 반환한다', () => {
    const src = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ] as const;
    const t = triangleFrom(src);
    expect(t).toEqual({
      a: { x: 1, y: 2 },
      b: { x: 3, y: 4 },
      c: { x: 5, y: 6 },
    });
  });
});

describe('copyInto', () => {
  test('TriangleLike object를 out에 복사하고 out을 반환한다', () => {
    const out = createTriangle();
    const src = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } });
  });

  test('세 XYInput으로 out을 갱신하고 out을 반환한다', () => {
    const out = createTriangle();
    const result = copyInto(out, { x: 7, y: 8 }, { x: 9, y: 10 }, { x: 11, y: 12 });
    expect(result).toBe(out);
    expect(out).toEqual({ a: { x: 7, y: 8 }, b: { x: 9, y: 10 }, c: { x: 11, y: 12 } });
  });

  test('TriangleTuple로도 복사할 수 있다', () => {
    const out = createTriangle();
    const src = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ] as const;
    copyInto(out, src);
    expect(out).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } });
  });

  test('aliasing: out == src여도 안전하게 복사한다', () => {
    const out = triangleFrom({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 });
    // out.a가 input a로 사용되는 aliasing 상황
    const srcAlias: { a: { x: number; y: number }; b: { x: number; y: number }; c: { x: number; y: number } } = out;
    copyInto(out, srcAlias);
    expect(out).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } });
  });
});

describe('triangleFrom', () => {
  test('TriangleLike를 새 TriangleWritable로 복사한다', () => {
    const src = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } };
    const result = triangleFrom(src);
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } });
    expect(result).not.toBe(src);
  });

  test('세 XYInput으로 새 TriangleWritable을 생성한다', () => {
    const result = triangleFrom({ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 });
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } });
  });
});
