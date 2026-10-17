/**
 * segment 교점 계산의 endpoint 접촉과 degenerate 경계 테스트.
 *
 * 한 segment의 시작점이 다른 segment의 안쪽에 닿는 경우는 매개변수가 정확히 0이라 시작점 좌표를
 * 그대로 기록해야 한다. a가 점이고 b 위에 없으면 교점이 없다. 할당형 `singleIntersection`은 교점이
 * 없으면 `undefined`를 돌려준다.
 */

import { describe, expect, test } from 'vitest';
import { singleIntersection } from '../../../src/segment/single-intersection';
import { singleIntersectionInto } from '../../../src/segment/single-intersection-into';

/** `(ax, ay)`에서 `(bx, by)`로 가는 plain segment를 만든다. */
function seg(ax: number, ay: number, bx: number, by: number) {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by } };
}

describe('singleIntersectionInto', () => {
  test('a가 점이고 b 위에 있지 않으면 false를 돌려주고 out을 바꾸지 않는다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, seg(5, 5, 5, 5), seg(0, 0, 10, 0))).toBe(false);
    expect(out).toEqual({ x: 9, y: 9 });
  });

  test('a의 시작점이 b의 안쪽에 닿으면 a의 시작점을 기록한다', () => {
    const out = { x: 9, y: 9 };
    expect(singleIntersectionInto(out, seg(5, 0, 5, 5), seg(0, 0, 10, 0))).toBe(true);
    expect(out).toEqual({ x: 5, y: 0 });
  });

  test('b의 시작점이 a의 안쪽에 닿으면 b의 시작점을 기록한다', () => {
    const out = { x: 9, y: 9 };
    // t1 = 7 / 25이고 0 + t1 * 25는 7.000000000000001이라 보간식을 쓰면 시작점과 어긋난다.
    expect(singleIntersectionInto(out, seg(0, 0, 25, 0), seg(7, 0, 7, 5))).toBe(true);
    expect(out).toEqual({ x: 7, y: 0 });
  });
});

describe('singleIntersection', () => {
  test('교점이 없으면 undefined를 돌려준다', () => {
    expect(singleIntersection(seg(0, 0, 1, 0), seg(5, 5, 5, 6))).toBeUndefined();
  });
});
