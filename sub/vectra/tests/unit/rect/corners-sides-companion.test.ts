/** 사각형 꼭짓점과 변의 순서 및 새 배열 반환을 시험한다. */

import { describe, expect, test } from 'vitest';
import { corners } from '../../../src/rect/corners';
import { cornersInto } from '../../../src/rect/corners-into';
import { sides } from '../../../src/rect/sides';
import { sidesInto } from '../../../src/rect/sides-into';
import type { SegmentWritable } from '../../../src/types/flat-shapes.internal';

const r = { x: 2, y: 3, width: 6, height: 4 };

describe('rect.corners — 새 배열 반환', () => {
  test('Into와 동일한 4개 corner point를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, r);
    expect(corners(r)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = corners(r);
    const result2 = corners(r);
    expect(result1).not.toBe(result2);
  });

  test('topLeft, topRight, bottomRight, bottomLeft 순서로 반환한다', () => {
    const result = corners(r);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ x: 2, y: 3 });
    expect(result[1]).toEqual({ x: 8, y: 3 });
    expect(result[2]).toEqual({ x: 8, y: 7 });
    expect(result[3]).toEqual({ x: 2, y: 7 });
  });

  test('zero-dimension rect에서도 4개 point를 반환한다', () => {
    expect(corners({ x: 0, y: 0, width: 0, height: 0 })).toHaveLength(4);
  });
});

describe('rect.sides — 새 배열 반환', () => {
  test('Into와 동일한 4개 segment를 반환한다', () => {
    const out: SegmentWritable[] = [];
    sidesInto(out, r);
    expect(sides(r)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = sides(r);
    const result2 = sides(r);
    expect(result1).not.toBe(result2);
  });

  test('top, right, bottom, left 순서로 반환한다', () => {
    const result = sides(r);
    expect(result).toHaveLength(4);
    // top
    expect(result[0]).toEqual({ x1: 2, y1: 3, x2: 8, y2: 3 });
    // right
    expect(result[1]).toEqual({ x1: 8, y1: 3, x2: 8, y2: 7 });
    // bottom
    expect(result[2]).toEqual({ x1: 8, y1: 7, x2: 2, y2: 7 });
    // left
    expect(result[3]).toEqual({ x1: 2, y1: 7, x2: 2, y2: 3 });
  });

  test('같은 꼭짓점을 잇는 선분도 각자 좌표를 보관한다', () => {
    const result = sides(r);
    result[0].x1 = 999;
    expect(result[3].x2).toBe(2);
  });
});
