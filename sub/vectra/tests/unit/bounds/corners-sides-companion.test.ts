import { describe, expect, test } from 'vitest';
import { corners } from '../../../src/bounds/corners';
import { sides } from '../../../src/bounds/sides';

const b = { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } };

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
    const inverted = { min: { x: 10, y: 10 }, max: { x: 0, y: 0 } };
    expect(corners(inverted)).toHaveLength(4);
  });
});

describe('bounds.sides', () => {
  test('top, right, bottom, left 순서로 반환한다', () => {
    const result = sides(b);
    expect(result).toHaveLength(4);
    // top
    expect(result[0]).toEqual({ a: { x: 1, y: 2 }, b: { x: 5, y: 2 } });
    // right
    expect(result[1]).toEqual({ a: { x: 5, y: 2 }, b: { x: 5, y: 8 } });
    // bottom
    expect(result[2]).toEqual({ a: { x: 5, y: 8 }, b: { x: 1, y: 8 } });
    // left
    expect(result[3]).toEqual({ a: { x: 1, y: 8 }, b: { x: 1, y: 2 } });
  });

  test('인접 side의 endpoint object가 독립 reference이다', () => {
    const result = sides(b);
    // mutation 시 인접 side에 전파되지 않는다
    result[0].a.x = 999;
    expect(result[3].b.x).toBe(1);
  });
});
