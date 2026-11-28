/** 두 경계 상자의 닫힌 경계 교차 판정과 빈 상자 처리를 시험한다. */

import { describe, expect, test } from 'vitest';
import { intersectsBoundsBounds } from '../../../src/intersects/intersects-bounds-bounds';

/** 최소 좌표가 최대 좌표보다 큰 빈 경계 상자를 만든다. */
function sentinel() {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

describe('bounds - intersectsBounds (closed boundary, edge touch = true)', () => {
  test('겹치는 두 bounds는 true', () => {
    expect(intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 3, minY: 3, maxX: 8, maxY: 8 })).toBe(
      true
    );
  });

  test('edge 전체가 접하는 경우는 true (closed boundary)', () => {
    expect(intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 5, minY: 0, maxX: 8, maxY: 5 })).toBe(
      true
    );
  });

  test('corner만 접하는 경우도 true (closed boundary)', () => {
    expect(intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 5, minY: 5, maxX: 8, maxY: 8 })).toBe(
      true
    );
  });

  test('disjoint bounds는 false', () => {
    expect(
      intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 6, minY: 6, maxX: 10, maxY: 10 })
    ).toBe(false);
  });

  test('x축 disjoint는 false', () => {
    expect(
      intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 7, minY: 0, maxX: 10, maxY: 5 })
    ).toBe(false);
  });

  test('y축 disjoint는 false', () => {
    expect(
      intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, { minX: 0, minY: 7, maxX: 5, maxY: 10 })
    ).toBe(false);
  });

  test('한쪽이 empty이면 false', () => {
    expect(intersectsBoundsBounds({ minX: 5, minY: 0, maxX: 0, maxY: 5 }, { minX: 0, minY: 0, maxX: 8, maxY: 8 })).toBe(
      false
    );
  });

  test('둘 다 empty이면 false', () => {
    expect(intersectsBoundsBounds(sentinel(), sentinel())).toBe(false);
  });

  test('line bounds 간 corner 접촉도 true (closed boundary)', () => {
    expect(intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 5, maxY: 0 }, { minX: 5, minY: 0, maxX: 8, maxY: 3 })).toBe(
      true
    );
  });

  test('포함 관계인 두 bounds는 true', () => {
    expect(
      intersectsBoundsBounds({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, { minX: 2, minY: 2, maxX: 8, maxY: 8 })
    ).toBe(true);
  });
});
