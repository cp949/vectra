/**
 * triangle vertex와 side index accessor를 검증한다.
 * 유효 index, invalid index, writable output을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { pointAtIndex } from '../../../src/triangle/point-at-index';
import { pointAtIndexInto } from '../../../src/triangle/point-at-index-into';
import { sideAt } from '../../../src/triangle/side-at';
import { sideAtInto } from '../../../src/triangle/side-at-into';

describe('pointAtIndexInto', () => {
  const triangle = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };

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

  test('invalid index: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x: 99, y: 99 };
    expect(pointAtIndexInto(out, triangle, -1)).toBe(false);
    expect(out).toEqual({ x: 99, y: 99 });
  });
});

describe('pointAtIndex', () => {
  const triangle = { x1: 1, y1: 2, x2: 3, y2: 4, x3: 5, y3: 6 };

  test('index 1: vertex b를 반환한다', () => {
    expect(pointAtIndex(triangle, 1)).toEqual({ x: 3, y: 4 });
  });

  test('invalid index: undefined를 반환한다', () => {
    expect(pointAtIndex(triangle, -1)).toBeUndefined();
  });
});

describe('sideAtInto', () => {
  const triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 };

  test('index 0: side BC(b→c)를 out에 기록하고 true를 반환한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };
    expect(sideAtInto(out, triangle, 0)).toBe(true);
    expect(out).toEqual({ x1: 4, y1: 0, x2: 2, y2: 3 });
  });

  test('index 1: side CA(c→a)를 out에 기록하고 true를 반환한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };
    expect(sideAtInto(out, triangle, 1)).toBe(true);
    expect(out).toEqual({ x1: 2, y1: 3, x2: 0, y2: 0 });
  });

  test('index 2: side AB(a→b)를 out에 기록하고 true를 반환한다', () => {
    const out = { x1: 0, y1: 0, x2: 0, y2: 0 };
    expect(sideAtInto(out, triangle, 2)).toBe(true);
    expect(out).toEqual({ x1: 0, y1: 0, x2: 4, y2: 0 });
  });

  test('invalid index: false를 반환하고 out을 수정하지 않는다', () => {
    const out = { x1: 99, y1: 99, x2: 99, y2: 99 };
    expect(sideAtInto(out, triangle, -1)).toBe(false);
    expect(out).toEqual({ x1: 99, y1: 99, x2: 99, y2: 99 });
  });
});

describe('sideAt', () => {
  const triangle = { x1: 0, y1: 0, x2: 4, y2: 0, x3: 2, y3: 3 };

  test('index 0: side BC(b→c)를 반환한다', () => {
    expect(sideAt(triangle, 0)).toEqual({ x1: 4, y1: 0, x2: 2, y2: 3 });
  });

  test('invalid index: undefined를 반환한다', () => {
    expect(sideAt(triangle, -1)).toBeUndefined();
  });
});
