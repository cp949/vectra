/**
 * triangle × segment/ray/infinite-line boundary 교점 collection helper 단위 테스트.
 *
 * ordering(line-family parameter `t` 오름차순), vertex/edge dedupe, edge collinear overlap,
 * containment-only, degenerate/non-finite, tuple/object 입력 동등성, `Into` clear/reference,
 * companion 새 object 정책을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { triangleInfiniteLineIntersections } from '../../../src/intersects/triangle-infinite-line-intersections';
import { triangleInfiniteLineIntersectionsInto } from '../../../src/intersects/triangle-infinite-line-intersections-into';
import { triangleRayIntersections } from '../../../src/intersects/triangle-ray-intersections';
import { triangleRayIntersectionsInto } from '../../../src/intersects/triangle-ray-intersections-into';
import { triangleSegmentIntersections } from '../../../src/intersects/triangle-segment-intersections';
import { triangleSegmentIntersectionsInto } from '../../../src/intersects/triangle-segment-intersections-into';
import type { TriangleLike, XYObjectWritable } from '../../../src/types';

/** point가 (x, y)와 근사적으로 같은지 확인한다. */
function expectPointClose(p: XYObjectWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

// 기준 right triangle: A(0,0), B(10,0), C(0,10). edge A-B는 x축, B-C는 hypotenuse(x+y=10), C-A는 y축.
const TRI: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } };

describe('triangleSegmentIntersections (S12-RM-009)', () => {
  test('segment crossing은 두 boundary 교점을 segment parameter 오름차순으로 반환한다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 5, 5);
  });

  test('vertex 접촉은 1점으로 dedupe한다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: -5, y: 5 }, b: { x: 5, y: -5 } });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 0);
  });

  test('edge collinear overlap은 clipped start/end 2점을 반환한다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 0);
    expectPointClose(points[1], 5, 0);
  });

  test('segment가 triangle 내부에 완전히 포함되면 빈 배열이다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: 2, y: 2 }, b: { x: 4, y: 4 } });
    expect(points).toEqual([]);
  });

  test('zero-length segment는 빈 배열이다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: 5, y: 0 }, b: { x: 5, y: 0 } });
    expect(points).toEqual([]);
  });

  test('epsilon은 segment range 바깥 교점을 포함시키지 않는다', () => {
    const points = triangleSegmentIntersections(TRI, { a: { x: -5, y: 5 }, b: { x: -0.5, y: 5 } }, 1);
    expect(points).toEqual([]);
  });
});

describe('triangleRayIntersections (S12-RM-009)', () => {
  test('ray origin이 triangle 내부면 exit 1점만 반환한다', () => {
    const points = triangleRayIntersections(TRI, { origin: { x: 1, y: 1 }, direction: { x: 1, y: 0 } });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 9, 1);
  });

  test('ray origin이 triangle 밖이면 enter/exit 두 교점을 ray parameter 오름차순으로 반환한다', () => {
    // origin (-1,5)에서 +x 방향: y축 edge 교점 (0,5)이 t=1, hypotenuse 교점 (5,5)이 t=6.
    const points = triangleRayIntersections(TRI, { origin: { x: -1, y: 5 }, direction: { x: 1, y: 0 } });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 5);
    expectPointClose(points[1], 5, 5);
  });

  test('ray가 edge와 collinear면 [0,∞) range로 clipping된 overlap start/end 2점을 반환한다', () => {
    // origin (5,0)은 edge A-B 위. +x 방향이라 t<0인 A쪽은 잘리고 t∈[0,5] 구간 (5,0)~(10,0)만 남는다.
    const points = triangleRayIntersections(TRI, { origin: { x: 5, y: 0 }, direction: { x: 1, y: 0 } });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 5, 0);
    expectPointClose(points[1], 10, 0);
  });

  test('ray collinear overlap이 한 점으로 수렴하면 1점으로 dedupe한다', () => {
    // origin (10,0)=vertex B에서 +x(삼각형 바깥) 방향. edge A-B overlap이 t=0 한 점으로만 남는다.
    const points = triangleRayIntersections(TRI, { origin: { x: 10, y: 0 }, direction: { x: 1, y: 0 } });
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 10, 0);
  });

  test('triangle이 ray 뒤에 있으면 빈 배열이다', () => {
    const points = triangleRayIntersections(TRI, { origin: { x: 20, y: 20 }, direction: { x: 1, y: 1 } });
    expect(points).toEqual([]);
  });

  test('epsilon은 ray range 뒤쪽 교점을 포함시키지 않는다', () => {
    const points = triangleRayIntersections(TRI, { origin: { x: 0.5, y: 5 }, direction: { x: 1, y: 0 } }, 1);
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 5);
  });

  test('zero-vector ray direction은 빈 배열이다', () => {
    const points = triangleRayIntersections(TRI, { origin: { x: 1, y: 1 }, direction: { x: 0, y: 0 } });
    expect(points).toEqual([]);
  });
});

describe('triangleInfiniteLineIntersections (S12-RM-009)', () => {
  test('direction이 음수여도 t 오름차순으로 두 교점을 반환한다', () => {
    const points = triangleInfiniteLineIntersections(TRI, { origin: { x: 0, y: 5 }, direction: { x: -1, y: 0 } });
    expect(points).toHaveLength(2);
    // origin (0,5)에서 -x 방향: hypotenuse 교점 (5,5)이 t=-5, y축 교점 (0,5)이 t=0.
    expectPointClose(points[0], 5, 5);
    expectPointClose(points[1], 0, 5);
  });

  test('infinite-line이 edge와 collinear면 clipping 없이 edge 양끝 2점을 반환한다', () => {
    // origin (0,0), +x 방향 line은 edge A-B(x축)와 collinear. range 무한이라 (0,0)~(10,0) 양끝이 남는다.
    const points = triangleInfiniteLineIntersections(TRI, { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } });
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 0);
    expectPointClose(points[1], 10, 0);
  });

  test('zero-vector infinite-line direction은 빈 배열이다', () => {
    const points = triangleInfiniteLineIntersections(TRI, { origin: { x: 1, y: 1 }, direction: { x: 0, y: 0 } });
    expect(points).toEqual([]);
  });
});

describe('triangle line-family degenerate / non-finite (S12-RM-009)', () => {
  test('degenerate triangle(collinear vertex)은 segment/point로 환원하지 않고 빈 배열이다', () => {
    const degenerate: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 20, y: 0 } };
    const points = triangleSegmentIntersections(degenerate, { a: { x: 5, y: -5 }, b: { x: 5, y: 5 } });
    expect(points).toEqual([]);
  });

  test('non-finite triangle vertex(NaN/Infinity/-Infinity)는 빈 배열이다', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const tri: TriangleLike = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: bad } };
      const points = triangleSegmentIntersections(tri, { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } });
      expect(points).toEqual([]);
    }
  });

  test('non-finite line coordinate(NaN/Infinity/-Infinity)는 빈 배열이다', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const points = triangleSegmentIntersections(TRI, { a: { x: bad, y: 5 }, b: { x: 15, y: 5 } });
      expect(points).toEqual([]);
    }
  });
});

describe('triangle line-family 입력/출력 정책 (S12-RM-009)', () => {
  test('tuple 입력과 object 입력 결과가 동등하다', () => {
    const objResult = triangleSegmentIntersections(TRI, { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } });
    const tupleResult = triangleSegmentIntersections(
      [
        [0, 0],
        [10, 0],
        [0, 10],
      ],
      [
        [-5, 5],
        [15, 5],
      ]
    );
    expect(tupleResult).toEqual(objResult);
  });

  test('Into는 기존 out을 clear하고 같은 array reference를 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 99, y: 99 }];
    const returned = triangleSegmentIntersectionsInto(out, TRI, { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } });
    expect(returned).toBe(out);
    expect(out).toHaveLength(2);
    expectPointClose(out[0], 0, 5);
  });

  test('companion은 호출마다 새 array와 새 nested point object를 반환한다', () => {
    const seg = { a: { x: -5, y: 5 }, b: { x: 15, y: 5 } };
    const first = triangleSegmentIntersections(TRI, seg);
    const second = triangleSegmentIntersections(TRI, seg);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first).toEqual(second);
  });

  test('ray/infinite-line companion도 새 array를 반환한다', () => {
    const ray = { origin: { x: 1, y: 1 }, direction: { x: 1, y: 0 } };
    expect(triangleRayIntersections(TRI, ray)).not.toBe(triangleRayIntersections(TRI, ray));
    const line = { origin: { x: 0, y: 5 }, direction: { x: -1, y: 0 } };
    expect(triangleInfiniteLineIntersections(TRI, line)).not.toBe(triangleInfiniteLineIntersections(TRI, line));
  });

  test('ray/infinite-line Into도 같은 array reference를 반환한다', () => {
    const rayOut: XYObjectWritable[] = [];
    expect(triangleRayIntersectionsInto(rayOut, TRI, { origin: { x: 1, y: 1 }, direction: { x: 1, y: 0 } })).toBe(
      rayOut
    );
    const lineOut: XYObjectWritable[] = [];
    expect(
      triangleInfiniteLineIntersectionsInto(lineOut, TRI, { origin: { x: 0, y: 5 }, direction: { x: -1, y: 0 } })
    ).toBe(lineOut);
  });
});
