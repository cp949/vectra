/**
 * ray degenerate 분기와 crop 실패 경계 테스트.
 *
 * `singleIntersectionInto`에서 방향 벡터가 0인 ray가 한쪽 또는 양쪽일 때, 점이 상대 ray의 뒤쪽에
 * 있거나 선에서 벗어난 경우를 확인한다. `cropByCircle`은 crop이 실패하면 `undefined`를 돌려준다.
 */

import { describe, expect, test } from 'vitest';
import { cropByCircle } from '../../../src/ray/crop-by-circle';
import { rayFrom } from '../../../src/ray/ray-from';
import { singleIntersectionInto } from '../../../src/ray/single-intersection-into';

/** +x 방향 ray. origin은 `(0, 0)`이다. */
const rayRight = rayFrom({ x: 0, y: 0 }, { x: 1, y: 0 });

/** 방향 벡터가 0인 degenerate ray. 점처럼 origin만 의미가 있다. */
function point(x: number, y: number) {
  return rayFrom({ x, y }, { x: 0, y: 0 });
}

describe('singleIntersectionInto — 양쪽 degenerate', () => {
  test('origin이 epsilon보다 멀면 false를 돌려주고 out을 바꾸지 않는다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, point(0, 0), point(1, 0))).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });
});

describe('singleIntersectionInto — a만 degenerate', () => {
  test('a.origin이 b의 뒤쪽이면 false다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, point(-1, 0), rayRight)).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });

  test('a.origin이 b의 선에서 벗어나면 false다', () => {
    expect(singleIntersectionInto({ x: 0, y: 0 }, point(2, 1), rayRight)).toBe(false);
  });
});

describe('singleIntersectionInto — b만 degenerate', () => {
  test('b.origin이 a 위에 있으면 b.origin을 기록하고 true다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, rayRight, point(3, 0))).toBe(true);
    expect(out).toEqual({ x: 3, y: 0 });
  });

  test('b.origin이 a의 뒤쪽이면 false다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, rayRight, point(-1, 0))).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });

  test('b.origin이 a의 선에서 벗어나면 false다', () => {
    expect(singleIntersectionInto({ x: 0, y: 0 }, rayRight, point(2, 1))).toBe(false);
  });
});

describe('cropByCircle', () => {
  test('ray가 circle과 만나지 않으면 undefined를 돌려준다', () => {
    const away = rayFrom({ x: 10, y: 0 }, { x: 1, y: 0 });
    expect(cropByCircle(away, { center: { x: 0, y: 0 }, radius: 1 })).toBeUndefined();
  });

  test('ray가 circle을 가로지르면 진입점과 탈출점을 잇는 segment를 돌려준다', () => {
    const through = rayFrom({ x: -5, y: 0 }, { x: 1, y: 0 });
    expect(cropByCircle(through, { center: { x: 0, y: 0 }, radius: 1 })).toEqual({
      a: { x: -1, y: 0 },
      b: { x: 1, y: 0 },
    });
  });
});
