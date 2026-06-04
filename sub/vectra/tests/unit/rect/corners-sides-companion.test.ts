import { describe, expect, test } from 'vitest';
import { corners } from '../../../src/rect/corners';
import { cornersInto } from '../../../src/rect/corners-into';
import { sides } from '../../../src/rect/sides';
import { sidesInto } from '../../../src/rect/sides-into';

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
    const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
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
    expect(result[0]).toEqual({ a: { x: 2, y: 3 }, b: { x: 8, y: 3 } });
    // right
    expect(result[1]).toEqual({ a: { x: 8, y: 3 }, b: { x: 8, y: 7 } });
    // bottom
    expect(result[2]).toEqual({ a: { x: 8, y: 7 }, b: { x: 2, y: 7 } });
    // left
    expect(result[3]).toEqual({ a: { x: 2, y: 7 }, b: { x: 2, y: 3 } });
  });

  test('인접 side의 endpoint object가 독립 reference이다 (companion)', () => {
    const result = sides(r);
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
    result[0].a.x = 999;
    expect(result[3].b.x).toBe(2);
  });

  test('인접 side의 endpoint object가 독립 reference이다 (Into)', () => {
    const out: { a: { x: number; y: number }; b: { x: number; y: number } }[] = [];
    sidesInto(out, r);
    expect(out[0].a).not.toBe(out[3].b);
    expect(out[0].b).not.toBe(out[1].a);
    expect(out[1].b).not.toBe(out[2].a);
    expect(out[2].b).not.toBe(out[3].a);
    out[0].a.x = 999;
    expect(out[3].b.x).toBe(2);
  });
});
