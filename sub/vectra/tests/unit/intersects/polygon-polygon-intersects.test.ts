/**
 * polygonPolygonIntersects lightweight boolean relation 단위 테스트 (S10-RM-007).
 *
 * edge crossing, shared vertex/edge touch, 한 polygon이 다른 polygon에 완전 포함, disjoint,
 * empty polygon, tuple/object 입력 동등성, non-finite vertex 정책 고정을 검증한다.
 * clipping/boolean output이 아니라 boolean relation만 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { polygonPolygonIntersects } from '../../../src/intersects/polygon-polygon-intersects';

const SQUARE = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 4 },
  { x: 0, y: 4 },
];

describe('polygonPolygonIntersects', () => {
  test('edge crossing은 true다', () => {
    const other = [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
      { x: 2, y: 6 },
    ];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('shared vertex touch는 true다', () => {
    const other = [
      { x: 4, y: 4 },
      { x: 8, y: 4 },
      { x: 8, y: 8 },
      { x: 4, y: 8 },
    ];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('shared edge overlap은 true다', () => {
    const other = [
      { x: 4, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 4 },
      { x: 4, y: 4 },
    ];
    expect(polygonPolygonIntersects(SQUARE, other)).toBe(true);
  });

  test('polygon A가 B 내부에 완전히 포함되면 true다', () => {
    const big = [
      { x: -10, y: -10 },
      { x: 10, y: -10 },
      { x: 10, y: 10 },
      { x: -10, y: 10 },
    ];
    expect(polygonPolygonIntersects(SQUARE, big)).toBe(true);
  });

  test('polygon B가 A 내부에 완전히 포함되면 true다', () => {
    const small = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ];
    expect(polygonPolygonIntersects(SQUARE, small)).toBe(true);
  });

  test('disjoint polygon은 false다', () => {
    const far = [
      { x: 100, y: 100 },
      { x: 104, y: 100 },
      { x: 104, y: 104 },
      { x: 100, y: 104 },
    ];
    expect(polygonPolygonIntersects(SQUARE, far)).toBe(false);
  });

  test('empty polygon(points.length < 3)은 false다', () => {
    const segment = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
    ];
    expect(polygonPolygonIntersects(SQUARE, segment)).toBe(false);
    expect(polygonPolygonIntersects(segment, SQUARE)).toBe(false);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objResult = polygonPolygonIntersects(SQUARE, [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
      { x: 2, y: 6 },
    ]);
    const tupleResult = polygonPolygonIntersects(
      [
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4],
      ],
      [
        [2, 2],
        [6, 2],
        [6, 6],
        [2, 6],
      ]
    );
    expect(tupleResult).toBe(objResult);
  });

  test('non-finite vertex 입력은 기존 polygon helper 정책을 따른다(disjoint면 false)', () => {
    // edge crossing(exact)도 vertex containment도 성립하지 않으므로 non-finite 종류와 무관하게 false.
    const far = [
      { x: 100, y: 100 },
      { x: 104, y: 100 },
      { x: 104, y: 104 },
    ];
    for (const v of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const badPoly = [
        { x: v, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ];
      expect(polygonPolygonIntersects(badPoly, far)).toBe(false);
      expect(polygonPolygonIntersects(far, badPoly)).toBe(false);
    }
  });
});
