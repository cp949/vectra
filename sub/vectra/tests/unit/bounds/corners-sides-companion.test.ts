/** 경계 상자의 꼭짓점과 변을 새 배열에 담는 순서를 시험한다. */

import { describe, expect, test } from 'vitest';
import { corners } from '../../../src/bounds/corners';
import { sides } from '../../../src/bounds/sides';

const b = { minX: 1, minY: 2, maxX: 5, maxY: 8 };

describe('bounds.corners', () => {
  test('topLeft, topRight, bottomRight, bottomLeft 순서로 반환한다', () => {
    const result = corners(b);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ x: 1, y: 2 });
    expect(result[1]).toEqual({ x: 5, y: 2 });
    expect(result[2]).toEqual({ x: 5, y: 8 });
    expect(result[3]).toEqual({ x: 1, y: 8 });
  });

  test('empty/inverted bounds에서도 4개 point를 반환한다', () => {
    const inverted = { minX: 10, minY: 10, maxX: 0, maxY: 0 };
    expect(corners(inverted)).toHaveLength(4);
  });
});

describe('bounds.sides', () => {
  test('top, right, bottom, left 순서로 반환한다', () => {
    const result = sides(b);
    expect(result).toHaveLength(4);
    // top
    expect(result[0]).toEqual({ x1: 1, y1: 2, x2: 5, y2: 2 });
    // right
    expect(result[1]).toEqual({ x1: 5, y1: 2, x2: 5, y2: 8 });
    // bottom
    expect(result[2]).toEqual({ x1: 5, y1: 8, x2: 1, y2: 8 });
    // left
    expect(result[3]).toEqual({ x1: 1, y1: 8, x2: 1, y2: 2 });
  });

  test('같은 꼭짓점을 잇는 선분도 각자 좌표를 보관한다', () => {
    const result = sides(b);
    // mutation 시 인접 side에 전파되지 않는다
    result[0].x1 = 999;
    expect(result[3].x2).toBe(1);
  });
});
