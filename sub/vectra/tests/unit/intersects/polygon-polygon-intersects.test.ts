/**
 * polygonPolygonIntersects lightweight boolean relation 단위 테스트 (S10-RM-007).
 *
 * edge crossing, shared vertex/edge touch, 한 polygon이 다른 polygon에 완전 포함, disjoint,
 * empty polygon, non-finite vertex 정책 고정을 검증한다.
 * clipping/boolean output이 아니라 boolean relation만 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { polygonPolygonIntersects } from '../../../src/intersects/polygon-polygon-intersects';

const SQUARE = [0, 0, 4, 0, 4, 4, 0, 4];

describe('polygonPolygonIntersects', () => {
  test('edge crossing은 true다', () => {
    const other = [2, 2, 6, 2, 6, 6, 2, 6];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('shared vertex touch는 true다', () => {
    const other = [4, 4, 8, 4, 8, 8, 4, 8];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('shared edge overlap은 true다', () => {
    const other = [4, 0, 8, 0, 8, 4, 4, 4];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('polygon A가 B 내부에 완전히 포함되면 true다', () => {
    const big = [-10, -10, 10, -10, 10, 10, -10, 10];
    expect(polygonPolygonIntersects(SQUARE, big)).toBe(true);
  });

  test('polygon B가 A 내부에 완전히 포함되면 true다', () => {
    const small = [1, 1, 2, 1, 2, 2, 1, 2];
    expect(polygonPolygonIntersects(SQUARE, small)).toBe(true);
  });

  test('disjoint polygon은 false다', () => {
    const far = [100, 100, 104, 100, 104, 104, 100, 104];
    expect(polygonPolygonIntersects(SQUARE, far)).toBe(false);
  });

  test('좌표 수가 6개 미만인 polygon은 false다', () => {
    const segment = [0, 0, 4, 0];
    expect(polygonPolygonIntersects(SQUARE, segment)).toBe(false);
    expect(polygonPolygonIntersects(segment, SQUARE)).toBe(false);
  });

  test('non-finite vertex 입력은 기존 polygon helper 정책을 따른다(disjoint면 false)', () => {
    // edge crossing(exact)도 vertex containment도 성립하지 않으므로 non-finite 종류와 무관하게 false.
    const far = [100, 100, 104, 100, 104, 104];
    for (const v of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const badPoly = [v, 0, 4, 0, 4, 4];
      expect(polygonPolygonIntersects(badPoly, far)).toBe(false);
      expect(polygonPolygonIntersects(far, badPoly)).toBe(false);
    }
  });
});
