import { describe, expect, test } from 'vitest';
import { singleIntersectionInto } from '../../../src/segment/single-intersection-into';
import type { XYWritable } from '../../../src/types';

describe('singleIntersectionInto — X자 교차', () => {
  test('X자 교차 segment의 교점 (5, 5)를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const b = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(5, 10);
  });

  test('out 참조를 반환하지 않고 boolean을 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
    const b = { a: { x: 0, y: 10 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(typeof result).toBe('boolean');
  });
});

describe('singleIntersectionInto — endpoint touch', () => {
  test('shared endpoint touch는 해당 endpoint를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // a.b === b.a: t1=1, t2=0 → a.b 우선
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 5 } };
    const b = { a: { x: 5, y: 5 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 5 });
  });

  test('T자 교차에서 b endpoint가 a interior에 닿을 때 b endpoint를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // t1=0.5, t2=1 → t2 endpoint(b.b)를 기록
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: -5 }, b: { x: 5, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('a endpoint가 b interior에 닿을 때 a endpoint를 기록한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // a.b=(5,0) lies on b, t1=1 → a.b 기록
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 0, y: -5 }, b: { x: 10, y: 5 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });
});

describe('singleIntersectionInto — parallel / collinear', () => {
  test('평행 disjoint segment는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('collinear overlap segment는 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 15, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('collinear endpoint touch도 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('collinear non-overlap segment는 false를 반환한다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 6, y: 0 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});

describe('singleIntersectionInto — non-crossing disjoint', () => {
  test('두 segment가 만나지 않으면 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    // a와 b의 line extension은 만나지만 segment 범위 안에서는 아니다
    const a = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 } };
    const b = { a: { x: 5, y: -1 }, b: { x: 5, y: 1 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});

describe('singleIntersectionInto — zero-length segment', () => {
  test('zero-length segment가 normal segment 위에 있으면 zero point를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('zero-length segment가 normal segment 위에 없으면 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const b = { a: { x: 5, y: 1 }, b: { x: 5, y: 1 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('zero-length segment(a)가 normal segment(b) 위에 있으면 a.a를 기록하고 true를 반환한다 (이전 케이스와 인자 순서 반전)', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // a가 zero-length, b가 normal: a.a를 기록
    const a = { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } };
    const b = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('두 zero-length segment가 같은 점이면 a.a를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('두 zero-length segment가 다른 점이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 5, y: 6 }, b: { x: 5, y: 6 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('두 zero-length segment가 epsilon 이내 거리이면 a.a를 기록하고 true를 반환한다', () => {
    const out: XYWritable = { x: 0, y: 0 };
    // distance = 1e-10 < epsilon = 1e-9 → (1e-10)² = 1e-20 ≤ (1e-9)² = 1e-18
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3 + 1e-10, y: 4 }, b: { x: 3 + 1e-10, y: 4 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('두 zero-length segment가 epsilon을 초과하는 거리이면 false를 반환하고 out을 수정하지 않는다', () => {
    const out: XYWritable = { x: 99, y: 99 };
    // distance = 1e-8 > epsilon = 1e-9 → (1e-8)² = 1e-16 > (1e-9)² = 1e-18
    const a = { a: { x: 3, y: 4 }, b: { x: 3, y: 4 } };
    const b = { a: { x: 3 + 1e-8, y: 4 }, b: { x: 3 + 1e-8, y: 4 } };
    const result = singleIntersectionInto(out, a, b);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});
