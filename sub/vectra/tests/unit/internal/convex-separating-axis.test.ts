/**
 * internal convex-separating-axis 단위 테스트.
 *
 * hasSeparatingEdgeNormal이 한 다각형의 변 법선 축만으로 분리를 판정하는지 검증한다.
 * 분리, 접촉(closed boundary), 포함, wrap 변, 비대칭 축 선택, NaN 처리를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { hasSeparatingEdgeNormal } from '../../../src/internal/convex-separating-axis';

/** 기준 삼각형 (0,0) (4,0) (0,4)의 평탄 배열. 변 법선 축이 x, y, 대각 방향이다. */
const TRIANGLE = [0, 0, 4, 0, 0, 4];

/**
 * 축 정렬 사각형의 평탄 배열을 만든다.
 * 꼭짓점 순서는 좌하, 우하, 우상, 좌상이다.
 */
function square(x: number, y: number, size: number): number[] {
  return [x, y, x + size, y, x + size, y + size, x, y + size];
}

describe('internal convex-separating-axis — hasSeparatingEdgeNormal', () => {
  test('한 변 법선 축에서 구간이 떨어지면 true를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(square(0, 0, 1), square(3, 0, 1))).toBe(true);
  });

  test('구간이 끝점에서 맞닿으면 분리가 아니라 false를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(square(0, 0, 1), square(1, 0, 1))).toBe(false);
    expect(hasSeparatingEdgeNormal(square(0, 0, 1), square(1, 1, 1))).toBe(false);
  });

  test('구간이 겹치면 false를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(square(0, 0, 2), square(1, 1, 2))).toBe(false);
  });

  test('other가 polygon 안에 완전히 들어 있으면 false를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(square(0, 0, 10), square(4, 4, 1))).toBe(false);
  });

  test('polygon이 other 안에 완전히 들어 있어도 false를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(square(4, 4, 1), square(0, 0, 10))).toBe(false);
  });

  test('마지막 변(마지막 꼭짓점에서 첫 꼭짓점)의 법선만 분리 축이면 true를 반환한다', () => {
    // 마지막 변 (0,4)→(0,0)의 법선은 x축이다. 나머지 두 축에서는 구간이 겹치거나 맞닿는다.
    expect(hasSeparatingEdgeNormal(TRIANGLE, square(-3, 1, 1))).toBe(true);
  });

  test('other의 변 법선에서만 분리되면 polygon 쪽 호출은 false를 반환한다', () => {
    // 사각형 (3,3)-(4,4)는 삼각형의 빗변 법선 축에서만 분리된다. AABB는 겹친다.
    const rect = square(3, 3, 1);
    expect(hasSeparatingEdgeNormal(rect, TRIANGLE)).toBe(false);
    expect(hasSeparatingEdgeNormal(TRIANGLE, rect)).toBe(true);
  });

  test('길이가 0인 변의 법선은 (0, 0)이라 분리 축이 되지 못한다', () => {
    expect(hasSeparatingEdgeNormal([1, 1, 1, 1, 1, 1], square(10, 10, 1))).toBe(false);
  });

  test('꼭짓점이 없는 polygon은 검사할 축이 없어 false를 반환한다', () => {
    expect(hasSeparatingEdgeNormal([], square(0, 0, 1))).toBe(false);
  });

  test('Float64Array 같은 ArrayLike도 같은 결과를 낸다', () => {
    expect(hasSeparatingEdgeNormal(new Float64Array(square(0, 0, 1)), new Float64Array(square(3, 0, 1)))).toBe(true);
    expect(hasSeparatingEdgeNormal(new Float64Array(square(0, 0, 1)), new Float64Array(square(1, 0, 1)))).toBe(false);
  });
});

describe('internal convex-separating-axis — NaN 동작', () => {
  test('other의 일부 투영값이 NaN이면 그 꼭짓점을 구간에서 빼고 판정한다', () => {
    // (NaN, 0)과 (NaN, 1)은 건너뛰고 (0,0), (0,1)만 구간에 들어간다. 삼각형과 겹친다.
    expect(hasSeparatingEdgeNormal(TRIANGLE, [0, 0, Number.NaN, 0, Number.NaN, 1, 0, 1])).toBe(false);
  });

  test('other의 투영값이 전부 NaN이면 구간이 비어 true를 반환한다', () => {
    expect(hasSeparatingEdgeNormal(TRIANGLE, [Number.NaN, 0, Number.NaN, 0, Number.NaN, 1, Number.NaN, 1])).toBe(true);
  });

  test('polygon 좌표에 NaN이 있으면 법선이 NaN인 축에서 구간이 비어 true를 반환한다', () => {
    expect(hasSeparatingEdgeNormal([Number.NaN, 0, 4, 0, 0, 4], square(0, 0, 1))).toBe(true);
  });
});
