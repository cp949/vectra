/**
 * infinite-line 반올림·degenerate·성공 경로 경계 테스트.
 *
 * 같은 방향 두 직선은 반올림 때문에 `|dot| / (|da| |db|)`가 1을 넘는데 각도는 0이어야 한다.
 * `b`만 degenerate이고 origin이 `a`의 직선 밖이면 교점이 없다. `segmentInsideCircle`은 직선이
 * circle을 가로지르면 chord segment를 돌려준다.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLineAngleBetween } from '../../../src/infinite-line/infinite-line-angle-between';
import { segmentInsideCircle } from '../../../src/infinite-line/segment-inside-circle';
import { singleIntersectionInto } from '../../../src/infinite-line/single-intersection-into';

describe('infiniteLineAngleBetween', () => {
  test('같은 방향이면 반올림으로 cos가 1을 넘어도 0을 돌려준다', () => {
    // (-12, -3)과 (-12, -3): |dot| / (|da| |db|) = 1.0000000000000002
    const line = { origin: { x: 0, y: 0 }, direction: { x: -12, y: -3 } };
    expect(infiniteLineAngleBetween(line, line)).toBe(0);
  });
});

describe('singleIntersectionInto — b만 degenerate', () => {
  test('b.origin이 a의 직선 밖이면 false를 돌려주고 out을 바꾸지 않는다', () => {
    const out = { x: 9, y: 9 };
    const a = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const b = { origin: { x: 2, y: 1 }, direction: { x: 0, y: 0 } };
    expect(singleIntersectionInto(out, a, b)).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });
});

describe('segmentInsideCircle', () => {
  test('직선이 circle을 가로지르면 chord segment를 돌려준다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    expect(segmentInsideCircle(line, { center: { x: 2, y: 0 }, radius: 1 })).toEqual({
      a: { x: 1, y: 0 },
      b: { x: 3, y: 0 },
    });
  });
});
