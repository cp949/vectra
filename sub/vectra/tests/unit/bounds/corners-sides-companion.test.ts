import { describe, expect, test } from 'vitest';
import { corners } from '../../../src/bounds/corners';
import { cornersInto } from '../../../src/bounds/corners-into';
import { sides } from '../../../src/bounds/sides';
import { sidesInto } from '../../../src/bounds/sides-into';

const b = { min: { x: 1, y: 2 }, max: { x: 5, y: 8 } };

describe('bounds.corners — 새 배열 반환', () => {
  test('Into와 동일한 4개 corner point를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    cornersInto(out, b);
    expect(corners(b)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = corners(b);
    const result2 = corners(b);
    expect(result1).not.toBe(result2);
  });

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

describe('bounds.sides — 새 배열 반환', () => {
  test('Into와 동일한 4개 segment를 반환한다', () => {
    const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
    sidesInto(out, b);
    expect(sides(b)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = sides(b);
    const result2 = sides(b);
    expect(result1).not.toBe(result2);
  });

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

  test('인접 side의 endpoint object가 독립 reference이다 (companion)', () => {
    const result = sides(b);
    // 8개 endpoint object 모두 서로 다른 reference여야 한다
    const refs = [
      result[0].a,
      result[0].b,
      result[1].a,
      result[1].b,
      result[2].a,
      result[2].b,
      result[3].a,
      result[3].b,
    ];
    for (let i = 0; i < refs.length; i += 1) {
      for (let j = i + 1; j < refs.length; j += 1) {
        expect(refs[i]).not.toBe(refs[j]);
      }
    }
    // mutation 시 인접 side에 전파되지 않는다
    result[0].a.x = 999;
    expect(result[3].b.x).toBe(1);
  });

  test('인접 side의 endpoint object가 독립 reference이다 (Into)', () => {
    const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
    sidesInto(out, b);
    expect(out[0].a).not.toBe(out[3].b);
    expect(out[0].b).not.toBe(out[1].a);
    expect(out[1].b).not.toBe(out[2].a);
    expect(out[2].b).not.toBe(out[3].a);
    out[0].a.x = 999;
    expect(out[3].b.x).toBe(1);
  });
});
