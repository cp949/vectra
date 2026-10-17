/**
 * rect 교집합·합집합의 축별 선택 경계 테스트.
 *
 * `intersectionInto`에서 b가 empty인 경우와 b가 x, y의 시작점을 더 크게, 오른쪽 끝을 더 작게 갖는
 * 경우, `unionInto`에서 b가 x, y의 시작점을 더 작게, 오른쪽·아래 끝을 더 크게 갖는 경우를 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { intersectionInto } from '../../../src/rect/intersection-into';
import { unionInto } from '../../../src/rect/union-into';
import type { RectWritable } from '../../../src/types';

/** `x, y, width, height` plain rect를 만든다. */
function rect(x: number, y: number, width: number, height: number): RectWritable {
  return { x, y, width, height };
}

describe('intersectionInto', () => {
  test('b의 width 또는 height가 0 이하이면 false를 돌려주고 out을 바꾸지 않는다', () => {
    const out = rect(9, 9, 9, 9);
    expect(intersectionInto(out, rect(0, 0, 10, 10), rect(2, 2, 0, 5))).toBe(false);
    expect(intersectionInto(out, rect(0, 0, 10, 10), rect(2, 2, 5, -1))).toBe(false);
    expect(out).toEqual(rect(9, 9, 9, 9));
  });

  test('b가 x, y의 시작점을 더 크게 가지면 b 쪽 값을 고른다', () => {
    const out = rect(0, 0, 0, 0);
    expect(intersectionInto(out, rect(0, 0, 10, 10), rect(3, 4, 20, 20))).toBe(true);
    expect(out).toEqual(rect(3, 4, 7, 6));
  });

  test('b의 오른쪽 끝이 더 작으면 b 쪽 값을 고른다', () => {
    const out = rect(0, 0, 0, 0);
    expect(intersectionInto(out, rect(0, 0, 10, 10), rect(-5, -5, 8, 30))).toBe(true);
    expect(out).toEqual(rect(0, 0, 3, 10));
  });
});

describe('unionInto', () => {
  test('b가 x, y의 시작점을 더 작게 가지면 b 쪽 값을 고른다', () => {
    const out = rect(0, 0, 0, 0);
    unionInto(out, rect(5, 6, 10, 10), rect(1, 2, 3, 3));
    expect(out).toEqual(rect(1, 2, 14, 14));
  });

  test('b의 오른쪽 끝이 더 크면 b 쪽 값을 고른다', () => {
    const out = rect(0, 0, 0, 0);
    unionInto(out, rect(0, 0, 10, 10), rect(2, 2, 20, 3));
    expect(out).toEqual(rect(0, 0, 22, 10));
  });

  test('b의 아래 끝이 더 크면 b 쪽 값을 고른다', () => {
    const out = rect(0, 0, 0, 0);
    unionInto(out, rect(0, 0, 10, 10), rect(2, 2, 3, 20));
    expect(out).toEqual(rect(0, 0, 10, 22));
  });
});
