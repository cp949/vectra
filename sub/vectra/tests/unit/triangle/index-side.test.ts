/**
 * triangle vertex와 side index accessor를 검증한다.
 * 유효 index, invalid index, tuple input, writable output을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { pointAtIndex } from '../../../src/triangle/point-at-index';
import { pointAtIndexInto } from '../../../src/triangle/point-at-index-into';
import { sideAt } from '../../../src/triangle/side-at';
import { sideAtInto } from '../../../src/triangle/side-at-into';

describe('pointAtIndexInto', () => {
  const triangle = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } };

  test('index 0: vertex a를 out에 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, triangle, 0)).toBe(true);
    expect(out).toEqual({ x: 1, y: 2 });
  });

  test('index 1: vertex b를 out에 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, triangle, 1)).toBe(true);
    expect(out).toEqual({ x: 3, y: 4 });
  });

  test('index 2: vertex c를 out에 기록하고 true를 반환한다', () => {
    const out = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, triangle, 2)).toBe(true);
    expect(out).toEqual({ x: 5, y: 6 });
  });

  test('index -1: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, triangle, -1)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('index 3: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, triangle, 3)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('index NaN: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, triangle, Number.NaN)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });

  test('tuple XYWritable에도 기록한다', () => {
    const out: [number, number] = [0, 0];
    expect(pointAtIndexInto(out, triangle, 1)).toBe(true);
    expect(out).toEqual([3, 4]);
  });

  test('TriangleTuple input도 처리한다', () => {
    const tup = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ] as const;
    const out = { x: 0, y: 0 };
    expect(pointAtIndexInto(out, tup, 2)).toBe(true);
    expect(out).toEqual({ x: 50, y: 60 });
  });
});

describe('pointAtIndex', () => {
  const triangle = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 }, c: { x: 5, y: 6 } };

  test('index 0: vertex a를 반환한다', () => {
    expect(pointAtIndex(triangle, 0)).toEqual({ x: 1, y: 2 });
  });

  test('index 1: vertex b를 반환한다', () => {
    expect(pointAtIndex(triangle, 1)).toEqual({ x: 3, y: 4 });
  });

  test('index 2: vertex c를 반환한다', () => {
    expect(pointAtIndex(triangle, 2)).toEqual({ x: 5, y: 6 });
  });

  test('invalid index: undefined를 반환한다', () => {
    expect(pointAtIndex(triangle, -1)).toBeUndefined();
    expect(pointAtIndex(triangle, 3)).toBeUndefined();
    expect(pointAtIndex(triangle, Number.NaN)).toBeUndefined();
  });
});

describe('sideAtInto', () => {
  const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } };

  test('index 0: side BC(b→c)를 out에 기록하고 true를 반환한다', () => {
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(sideAtInto(out, triangle, 0)).toBe(true);
    expect(out).toEqual({ a: { x: 4, y: 0 }, b: { x: 2, y: 3 } });
  });

  test('index 1: side CA(c→a)를 out에 기록하고 true를 반환한다', () => {
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(sideAtInto(out, triangle, 1)).toBe(true);
    expect(out).toEqual({ a: { x: 2, y: 3 }, b: { x: 0, y: 0 } });
  });

  test('index 2: side AB(a→b)를 out에 기록하고 true를 반환한다', () => {
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(sideAtInto(out, triangle, 2)).toBe(true);
    expect(out).toEqual({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } });
  });

  test('index -1: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } };
    expect(sideAtInto(out, triangle, -1)).toBe(false);
    expect(out).toEqual({ a: { x: 99, y: 99 }, b: { x: 99, y: 99 } });
  });

  test('index 3: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } };
    expect(sideAtInto(out, triangle, 3)).toBe(false);
    expect(out).toEqual({ a: { x: 99, y: 99 }, b: { x: 99, y: 99 } });
  });

  test('index NaN: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { a: { x: 99, y: 99 }, b: { x: 99, y: 99 } };
    expect(sideAtInto(out, triangle, Number.NaN)).toBe(false);
    expect(out).toEqual({ a: { x: 99, y: 99 }, b: { x: 99, y: 99 } });
  });

  test('TriangleTuple input도 처리한다', () => {
    const tup = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 2, y: 3 },
    ] as const;
    const out = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(sideAtInto(out, tup, 0)).toBe(true);
    expect(out).toEqual({ a: { x: 4, y: 0 }, b: { x: 2, y: 3 } });
  });
});

describe('sideAt', () => {
  const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 3 } };

  test('index 0: side BC(b→c)를 반환한다', () => {
    expect(sideAt(triangle, 0)).toEqual({ a: { x: 4, y: 0 }, b: { x: 2, y: 3 } });
  });

  test('index 1: side CA(c→a)를 반환한다', () => {
    expect(sideAt(triangle, 1)).toEqual({ a: { x: 2, y: 3 }, b: { x: 0, y: 0 } });
  });

  test('index 2: side AB(a→b)를 반환한다', () => {
    expect(sideAt(triangle, 2)).toEqual({ a: { x: 0, y: 0 }, b: { x: 4, y: 0 } });
  });

  test('invalid index: undefined를 반환한다', () => {
    expect(sideAt(triangle, -1)).toBeUndefined();
    expect(sideAt(triangle, 3)).toBeUndefined();
    expect(sideAt(triangle, Number.NaN)).toBeUndefined();
  });
});
