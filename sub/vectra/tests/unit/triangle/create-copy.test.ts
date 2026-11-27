/**
 * triangle 생성과 복사 API를 검증한다.
 * createTriangle, triangleFrom의 새 객체 생성, copyInto aliasing을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/triangle/copy-into';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { triangleFrom } from '../../../src/triangle/triangle-from';

describe('createTriangle', () => {
  test('인수 없이 호출하면 모든 vertex가 {x:0,y:0}인 빈 triangle을 반환한다', () => {
    const t = createTriangle();
    expect(t).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 });
  });
});

describe('copyInto', () => {
  test('평평한 triangle를 out에 복사하고 out을 반환한다', () => {
    const out = createTriangle();
    const src = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
    expect(out).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 });
  });

  test('aliasing: out == src여도 안전하게 복사한다', () => {
    const out = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };
    expect(copyInto(out, out)).toBe(out);
    expect(out).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 });
  });
});

describe('triangleFrom', () => {
  test('평평한 triangle을 새 TriangleWritable로 복사한다', () => {
    const src = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };
    const result = triangleFrom(src);
    expect(result).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 });
    expect(result).not.toBe(src);
  });
});
