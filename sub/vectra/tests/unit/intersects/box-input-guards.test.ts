/**
 * bounds·rect·삼각형 입력의 퇴화 가드를 확인하는 테스트.
 * 뒤집힌 bounds, 너비·높이 0 이하 rect, 퇴화 삼각형이 miss로 끝나는지 본다.
 * 직선 계열 단일 교점 companion의 hit 경로도 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { circleBoundsIntersectionsInto } from '../../../src/intersects/circle-bounds-intersections-into';
import { infiniteLineBoundsIntersectionsInto } from '../../../src/intersects/infinite-line-bounds-intersections-into';
import { infiniteLineRectIntersectionsInto } from '../../../src/intersects/infinite-line-rect-intersections-into';
import { intersectsBoundsBounds } from '../../../src/intersects/intersects-bounds-bounds';
import { intersectsBoundsTriangle } from '../../../src/intersects/intersects-bounds-triangle';
import { intersectsRectRect } from '../../../src/intersects/intersects-rect-rect';
import { intersectsRectTriangle } from '../../../src/intersects/intersects-rect-triangle';
import { rayBoundsIntersectionsInto } from '../../../src/intersects/ray-bounds-intersections-into';
import { rayRectIntersectionsInto } from '../../../src/intersects/ray-rect-intersections-into';
import { singleIntersectionInfiniteLineBounds } from '../../../src/intersects/single-intersection-infinite-line-bounds';
import { singleIntersectionInfiniteLineBoundsInto } from '../../../src/intersects/single-intersection-infinite-line-bounds-into';
import { singleIntersectionInfiniteLineRect } from '../../../src/intersects/single-intersection-infinite-line-rect';
import { singleIntersectionInfiniteLineRectInto } from '../../../src/intersects/single-intersection-infinite-line-rect-into';
import { singleIntersectionInfiniteLineTriangle } from '../../../src/intersects/single-intersection-infinite-line-triangle';
import { singleIntersectionRayBounds } from '../../../src/intersects/single-intersection-ray-bounds';
import { singleIntersectionRayBoundsInto } from '../../../src/intersects/single-intersection-ray-bounds-into';
import { singleIntersectionRayRectInto } from '../../../src/intersects/single-intersection-ray-rect-into';
import { singleIntersectionSegmentBounds } from '../../../src/intersects/single-intersection-segment-bounds';
import { singleIntersectionSegmentRect } from '../../../src/intersects/single-intersection-segment-rect';
import { singleIntersectionSegmentRectInto } from '../../../src/intersects/single-intersection-segment-rect-into';
import { triangleTriangleIntersectionsInto } from '../../../src/intersects/triangle-triangle-intersections-into';

const bounds = { min: { x: 1, y: 1 }, max: { x: 5, y: 5 } };
const invertedX = { min: { x: 5, y: 1 }, max: { x: 1, y: 5 } };
const invertedY = { min: { x: 1, y: 5 }, max: { x: 5, y: 1 } };
const rect = { x: 1, y: 1, width: 4, height: 4 };
const zeroWidthRect = { x: 1, y: 1, width: 0, height: 4 };
const zeroHeightRect = { x: 1, y: 1, width: 4, height: 0 };
const horizontalLine = { a: { x: 0, y: 3 }, b: { x: 10, y: 3 } };
const horizontalRay = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };
const horizontalInfinite = { origin: { x: 0, y: 3 }, direction: { x: 1, y: 0 } };

describe('뒤집힌 bounds 가드', () => {
  test('singleIntersectionSegmentBounds는 min.x가 max.x보다 크면 undefined를 반환한다', () => {
    expect(singleIntersectionSegmentBounds(horizontalLine, invertedX)).toBeUndefined();
  });

  test('singleIntersectionSegmentBounds는 min.y가 max.y보다 크면 undefined를 반환한다', () => {
    expect(singleIntersectionSegmentBounds(horizontalLine, invertedY)).toBeUndefined();
  });

  test('singleIntersectionRayBounds는 뒤집힌 bounds에서 undefined를 반환한다', () => {
    expect(singleIntersectionRayBounds(horizontalRay, invertedX)).toBeUndefined();
    expect(singleIntersectionRayBounds(horizontalRay, invertedY)).toBeUndefined();
  });

  test('singleIntersectionRayBoundsInto는 뒤집힌 bounds에서 false를 반환하고 out을 건드리지 않는다', () => {
    const out = { x: 7, y: 8 };
    expect(singleIntersectionRayBoundsInto(out, horizontalRay, invertedX)).toBe(false);
    expect(singleIntersectionRayBoundsInto(out, horizontalRay, invertedY)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('singleIntersectionInfiniteLineBounds는 뒤집힌 bounds에서 undefined를 반환한다', () => {
    expect(singleIntersectionInfiniteLineBounds(horizontalInfinite, invertedX)).toBeUndefined();
    expect(singleIntersectionInfiniteLineBounds(horizontalInfinite, invertedY)).toBeUndefined();
  });

  test('singleIntersectionInfiniteLineBoundsInto는 뒤집힌 bounds에서 false를 반환하고 out을 건드리지 않는다', () => {
    const out = { x: 7, y: 8 };
    expect(singleIntersectionInfiniteLineBoundsInto(out, horizontalInfinite, invertedX)).toBe(false);
    expect(singleIntersectionInfiniteLineBoundsInto(out, horizontalInfinite, invertedY)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('circleBoundsIntersectionsInto는 뒤집힌 bounds에서 기존 출력을 비우고 빈 배열을 반환한다', () => {
    const out = [{ x: 9, y: 9 }];
    const circle = { center: { x: 3, y: 3 }, radius: 2 };
    expect(circleBoundsIntersectionsInto(out, circle, invertedX)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    circleBoundsIntersectionsInto(out, circle, invertedY);
    expect(out).toEqual([]);
  });

  test('infiniteLineBoundsIntersectionsInto는 뒤집힌 bounds에서 기존 출력을 비운다', () => {
    const out = [{ x: 9, y: 9 }];
    expect(infiniteLineBoundsIntersectionsInto(out, horizontalInfinite, invertedX)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    infiniteLineBoundsIntersectionsInto(out, horizontalInfinite, invertedY);
    expect(out).toEqual([]);
  });

  test('rayBoundsIntersectionsInto는 뒤집힌 bounds에서 기존 출력을 비운다', () => {
    const out = [{ x: 9, y: 9 }];
    expect(rayBoundsIntersectionsInto(out, horizontalRay, invertedX)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    rayBoundsIntersectionsInto(out, horizontalRay, invertedY);
    expect(out).toEqual([]);
  });

  test('intersectsBoundsBounds는 두 번째 인자가 뒤집힌 bounds이면 false를 반환한다', () => {
    expect(intersectsBoundsBounds(bounds, invertedX)).toBe(false);
    expect(intersectsBoundsBounds(bounds, invertedY)).toBe(false);
  });
});

describe('너비·높이 0 이하 rect 가드', () => {
  test('singleIntersectionSegmentRect는 너비 또는 높이가 0이면 undefined를 반환한다', () => {
    expect(singleIntersectionSegmentRect(horizontalLine, zeroWidthRect)).toBeUndefined();
    expect(singleIntersectionSegmentRect(horizontalLine, zeroHeightRect)).toBeUndefined();
  });

  test('singleIntersectionSegmentRectInto는 너비 또는 높이가 0이면 false를 반환하고 out을 건드리지 않는다', () => {
    const out = { x: 7, y: 8 };
    expect(singleIntersectionSegmentRectInto(out, horizontalLine, zeroWidthRect)).toBe(false);
    expect(singleIntersectionSegmentRectInto(out, horizontalLine, zeroHeightRect)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('singleIntersectionRayRectInto는 너비 또는 높이가 0이면 false를 반환하고 out을 건드리지 않는다', () => {
    const out = { x: 7, y: 8 };
    expect(singleIntersectionRayRectInto(out, horizontalRay, zeroWidthRect)).toBe(false);
    expect(singleIntersectionRayRectInto(out, horizontalRay, zeroHeightRect)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('singleIntersectionInfiniteLineRectInto는 너비 또는 높이가 0이면 false를 반환하고 out을 건드리지 않는다', () => {
    const out = { x: 7, y: 8 };
    expect(singleIntersectionInfiniteLineRectInto(out, horizontalInfinite, zeroWidthRect)).toBe(false);
    expect(singleIntersectionInfiniteLineRectInto(out, horizontalInfinite, zeroHeightRect)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('infiniteLineRectIntersectionsInto는 너비 또는 높이가 0이면 기존 출력을 비운다', () => {
    const out = [{ x: 9, y: 9 }];
    expect(infiniteLineRectIntersectionsInto(out, horizontalInfinite, zeroWidthRect)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    infiniteLineRectIntersectionsInto(out, horizontalInfinite, zeroHeightRect);
    expect(out).toEqual([]);
  });

  test('rayRectIntersectionsInto는 너비 또는 높이가 0이면 기존 출력을 비운다', () => {
    const out = [{ x: 9, y: 9 }];
    expect(rayRectIntersectionsInto(out, horizontalRay, zeroWidthRect)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    rayRectIntersectionsInto(out, horizontalRay, zeroHeightRect);
    expect(out).toEqual([]);
  });

  test('intersectsRectRect는 두 번째 rect의 너비 또는 높이가 0이면 false를 반환한다', () => {
    expect(intersectsRectRect(rect, zeroWidthRect)).toBe(false);
    expect(intersectsRectRect(rect, zeroHeightRect)).toBe(false);
  });
});

describe('직선 계열 단일 교점 companion의 hit 경로', () => {
  // 단일 교점은 교점이 정확히 하나일 때만 반환한다. 모서리나 꼭짓점에 스치는 직선을 쓴다.
  const cornerGrazing = { origin: { x: 0, y: 2 }, direction: { x: 1, y: -1 } };

  test('singleIntersectionInfiniteLineBounds는 bounds 모서리에 스치면 그 교점을 반환한다', () => {
    const hit = singleIntersectionInfiniteLineBounds(cornerGrazing, bounds);
    expect(hit?.x).toBeCloseTo(1, 12);
    expect(hit?.y).toBeCloseTo(1, 12);
  });

  test('singleIntersectionInfiniteLineRect는 rect 모서리에 스치면 그 교점을 반환한다', () => {
    const hit = singleIntersectionInfiniteLineRect(cornerGrazing, rect);
    expect(hit?.x).toBeCloseTo(1, 12);
    expect(hit?.y).toBeCloseTo(1, 12);
  });

  test('singleIntersectionInfiniteLineTriangle은 꼭짓점에 스치면 그 교점을 반환한다', () => {
    const triangle = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } };
    const apexGrazing = { origin: { x: 0, y: 4 }, direction: { x: 1, y: 0 } };
    const hit = singleIntersectionInfiniteLineTriangle(apexGrazing, triangle);
    expect(hit?.x).toBeCloseTo(2, 12);
    expect(hit?.y).toBeCloseTo(4, 12);
  });
});

describe('삼각형 입력 가드', () => {
  test('intersectsBoundsTriangle은 삼각형이 bounds 아래에 있으면 false를 반환한다', () => {
    const below = { a: { x: 0, y: -5 }, b: { x: 4, y: -5 }, c: { x: 2, y: -1 } };
    expect(intersectsBoundsTriangle({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, below)).toBe(false);
  });

  test('intersectsBoundsTriangle은 삼각형이 bounds 위에 있으면 false를 반환한다', () => {
    const above = { a: { x: 0, y: 8 }, b: { x: 4, y: 8 }, c: { x: 2, y: 12 } };
    expect(intersectsBoundsTriangle({ min: { x: 0, y: 0 }, max: { x: 5, y: 5 } }, above)).toBe(false);
  });

  test('intersectsRectTriangle은 삼각형이 rect 아래에 있으면 false를 반환한다', () => {
    const below = { a: { x: 0, y: -5 }, b: { x: 4, y: -5 }, c: { x: 2, y: -1 } };
    expect(intersectsRectTriangle({ x: 0, y: 0, width: 5, height: 5 }, below)).toBe(false);
  });

  test('intersectsRectTriangle은 삼각형이 rect 위에 있으면 false를 반환한다', () => {
    const above = { a: { x: 0, y: 8 }, b: { x: 4, y: 8 }, c: { x: 2, y: 12 } };
    expect(intersectsRectTriangle({ x: 0, y: 0, width: 5, height: 5 }, above)).toBe(false);
  });

  test('triangleTriangleIntersectionsInto는 두 번째 삼각형이 퇴화이면 기존 출력을 비운다', () => {
    const valid = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: 4 } };
    const collinear = { a: { x: 0, y: 0 }, b: { x: 1, y: 1 }, c: { x: 2, y: 2 } };
    const nonFinite = { a: { x: 0, y: 0 }, b: { x: Number.NaN, y: 1 }, c: { x: 2, y: 2 } };
    const out = [{ x: 9, y: 9 }];
    expect(triangleTriangleIntersectionsInto(out, valid, collinear)).toBe(out);
    expect(out).toEqual([]);
    out.push({ x: 9, y: 9 });
    triangleTriangleIntersectionsInto(out, valid, nonFinite);
    expect(out).toEqual([]);
  });
});
