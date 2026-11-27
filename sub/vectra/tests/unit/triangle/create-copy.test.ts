/**
 * triangle 생성과 복사 API를 검증한다.
 * createTriangle의 원점 삼각형, copyInto의 필드 복사, triangleFrom의 새 객체 생성을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { copyInto } from '../../../src/triangle/copy-into';
import { createTriangle } from '../../../src/triangle/create-triangle';
import { triangleFrom } from '../../../src/triangle/triangle-from';

describe('createTriangle', () => {
  test('인수 없이 호출하면 꼭짓점 좌표가 모두 0인 triangle을 반환한다', () => {
    const t = createTriangle();
    expect(t).toEqual({ x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 });
  });
});

describe('copyInto', () => {
  test('평평한 triangle을 out에 복사하고 out을 반환한다', () => {
    const out = createTriangle();
    const src = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };
    const result = copyInto(out, src);
    expect(result).toBe(out);
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
