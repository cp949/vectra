/**
 * bounds 인자 형태와 축별 min/max 선택 경계 테스트.
 *
 * `boundsFrom(min, max)` 두 인자 형태, `intersectionInto`에서 b가 empty인 경우와 각 축에서 b가 더
 * 안쪽인 경우, `unionInto`에서 b가 각 축으로 더 바깥인 경우를 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { boundsFrom } from '../../../src/bounds/bounds-from';
import { intersectionInto } from '../../../src/bounds/intersection-into';
import { unionInto } from '../../../src/bounds/union-into';
import type { BoundsWritable } from '../../../src/types';

/** `(minX, minY)`~`(maxX, maxY)` plain bounds를 만든다. */
function box(minX: number, minY: number, maxX: number, maxY: number): BoundsWritable {
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

describe('boundsFrom', () => {
  test('min과 max 두 인자로 새 bounds를 만든다', () => {
    const result = boundsFrom({ x: 1, y: 2 }, { x: 3, y: 4 });
    expect(result).toEqual(box(1, 2, 3, 4));
  });
});

describe('intersectionInto', () => {
  test('b가 empty이면 false를 돌려주고 out을 바꾸지 않는다', () => {
    const out = box(9, 9, 9, 9);
    expect(intersectionInto(out, box(0, 0, 10, 10), box(5, 5, 1, 1))).toBe(false);
    expect(out).toEqual(box(9, 9, 9, 9));
  });

  test('b가 x, y의 min을 더 크게, x의 max를 더 작게 가지면 b 쪽 값을 고른다', () => {
    const out = box(0, 0, 0, 0);
    expect(intersectionInto(out, box(0, 0, 10, 10), box(2, 3, 6, 20))).toBe(true);
    expect(out).toEqual(box(2, 3, 6, 10));
  });

  test('b가 y의 max를 더 작게 가지면 b 쪽 값을 고른다', () => {
    const out = box(0, 0, 0, 0);
    expect(intersectionInto(out, box(0, 0, 10, 10), box(-5, -5, 20, 7))).toBe(true);
    expect(out).toEqual(box(0, 0, 10, 7));
  });
});

describe('unionInto', () => {
  test('b가 x의 min을 더 작게, y의 min을 더 작게, x의 max를 더 크게 가지면 b 쪽 값을 고른다', () => {
    const out = box(0, 0, 0, 0);
    unionInto(out, box(0, 0, 10, 10), box(-3, -4, 12, 5));
    expect(out).toEqual(box(-3, -4, 12, 10));
  });

  test('b가 y의 max를 더 크게 가지면 b 쪽 값을 고른다', () => {
    const out = box(0, 0, 0, 0);
    unionInto(out, box(0, 0, 10, 10), box(2, 2, 5, 15));
    expect(out).toEqual(box(0, 0, 10, 15));
  });
});
