/**
 * line-family × ellipse 다중 교점 collection helper 단위 테스트.
 *
 * S10-RM-005: single-intersection API가 손실하는 2점 crossing을 collection으로 노출하는
 * segment/ray/infinite-line × ellipse helper를 검증한다. proper two-point의 t 오름차순,
 * tangent 1점, no hit, segment/ray range 경계(range 안 2점 / range 안 1점 / range 밖 0점),
 * contained interior, degenerate direction, empty ellipse, out array clear/reference 보존,
 * companion fresh array, tuple/object 입력 동등성을 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { infiniteLineEllipseIntersections } from '../../../src/intersects/infinite-line-ellipse-intersections';
import { infiniteLineEllipseIntersectionsInto } from '../../../src/intersects/infinite-line-ellipse-intersections-into';
import { rayEllipseIntersections } from '../../../src/intersects/ray-ellipse-intersections';
import { rayEllipseIntersectionsInto } from '../../../src/intersects/ray-ellipse-intersections-into';
import { segmentEllipseIntersections } from '../../../src/intersects/segment-ellipse-intersections';
import { segmentEllipseIntersectionsInto } from '../../../src/intersects/segment-ellipse-intersections-into';

// 중심 원점, radiusX=2, radiusY=1 ellipse를 기본 fixture로 쓴다.
const ellipse = { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 1 };

describe('infiniteLineEllipseIntersections', () => {
  test('ellipse를 가로지르는 infinite-line은 두 교점을 line parameter t 오름차순으로 반환한다', () => {
    // x축을 따르는 수평선은 (-2,0)과 (2,0)에서 교차한다. origin (-5,0), direction (+x).
    const line = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    const out: { x: number; y: number }[] = [];
    const result = infiniteLineEllipseIntersectionsInto(out, line, ellipse);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    // t=3 → (-2,0), t=7 → (2,0). origin이 왼쪽이므로 -2가 먼저다.
    expect(out[0].x).toBeCloseTo(-2, 12);
    expect(out[0].y).toBeCloseTo(0, 12);
    expect(out[1].x).toBeCloseTo(2, 12);
    expect(out[1].y).toBeCloseTo(0, 12);
  });

  test('tangent line은 한 점만 반환한다', () => {
    // y=1 수평선은 ellipse 위쪽 꼭짓점 (0,1)에서 접한다.
    const line = { origin: { x: -5, y: 1 }, direction: { x: 1, y: 0 } };
    const result = infiniteLineEllipseIntersections(line, ellipse);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(0, 9);
    expect(result[0].y).toBeCloseTo(1, 9);
  });

  test('음의 방향 infinite-line은 교점을 t 오름차순(좌표 내림차순)으로 반환한다', () => {
    // origin (5,0), direction (-x). t=3 → (2,0), t=7 → (-2,0).
    // 정렬이 t 기준이면 첫 point가 더 큰 x(2)를 갖고, 좌표 오름차순이 아니다.
    const line = { origin: { x: 5, y: 0 }, direction: { x: -1, y: 0 } };
    const result = infiniteLineEllipseIntersections(line, ellipse);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBeCloseTo(2, 12);
    expect(result[1].x).toBeCloseTo(-2, 12);
    // t 기준 정렬 확인: 첫 point x가 둘째 point x보다 크다(좌표 오름차순이 아님).
    expect(result[0].x).toBeGreaterThan(result[1].x);
  });

  test('no hit line은 빈 배열을 반환한다', () => {
    // y=2 수평선은 ellipse(radiusY=1) 바깥을 지난다.
    const line = { origin: { x: -5, y: 2 }, direction: { x: 1, y: 0 } };
    expect(infiniteLineEllipseIntersections(line, ellipse)).toEqual([]);
  });

  test('degenerate direction(zero-length)은 빈 배열을 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(infiniteLineEllipseIntersections(line, ellipse)).toEqual([]);
  });

  test('empty ellipse는 빈 배열을 반환한다', () => {
    const line = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    expect(infiniteLineEllipseIntersections(line, { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 1 })).toEqual([]);
  });

  test('tuple 입력과 object 입력은 같은 좌표를 반환한다', () => {
    const lineObj = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    // InfiniteLineTuple = readonly [origin, direction]
    const lineTuple = [
      [-5, 0],
      [1, 0],
    ] as const;
    const ellipseTuple = [[0, 0], 2, 1] as const;
    expect(infiniteLineEllipseIntersections(lineTuple, ellipseTuple)).toEqual(
      infiniteLineEllipseIntersections(lineObj, ellipse)
    );
  });
});

describe('segmentEllipseIntersections', () => {
  test('range 안 양 끝이 바깥인 segment는 두 교점을 t 오름차순으로 반환한다', () => {
    // (-5,0) → (5,0) segment는 (-2,0)과 (2,0)에서 교차한다.
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    const out: { x: number; y: number }[] = [];
    const result = segmentEllipseIntersectionsInto(out, segment, ellipse);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0].x).toBeCloseTo(-2, 12);
    expect(out[1].x).toBeCloseTo(2, 12);
  });

  test('한 끝이 내부인 segment는 range 안 exit 한 점만 반환한다', () => {
    // a=(0,0) 내부, b=(5,0) 바깥. exit (2,0) 한 점만 range 안에 있다.
    const segment = { a: { x: 0, y: 0 }, b: { x: 5, y: 0 } };
    const result = segmentEllipseIntersections(segment, ellipse);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(2, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('교점이 range 밖에 있는 segment는 빈 배열을 반환한다', () => {
    // (-5,0) → (-3,0) segment. line은 ellipse를 가로지르지만 t in [0,1]에는 교점이 없다.
    const segment = { a: { x: -5, y: 0 }, b: { x: -3, y: 0 } };
    expect(segmentEllipseIntersections(segment, ellipse)).toEqual([]);
  });

  test('tangent 접점 t가 range 밖인 segment는 빈 배열을 반환한다', () => {
    // y=1 line은 ellipse 위쪽 꼭짓점 (0,1)에서 접한다. 접점 x=0.
    // segment (1,1) → (5,1)은 접점 x=0을 포함하지 않아 접점 t가 range 밖이다.
    const segment = { a: { x: 1, y: 1 }, b: { x: 5, y: 1 } };
    expect(segmentEllipseIntersections(segment, ellipse)).toEqual([]);
  });

  test('contained segment(양 끝 내부)는 빈 배열을 반환한다', () => {
    const segment = { a: { x: -1, y: 0 }, b: { x: 1, y: 0 } };
    expect(segmentEllipseIntersections(segment, ellipse)).toEqual([]);
  });

  test('zero-length segment(degenerate direction)는 빈 배열을 반환한다', () => {
    const segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
    expect(segmentEllipseIntersections(segment, ellipse)).toEqual([]);
  });

  test('empty ellipse는 빈 배열을 반환한다', () => {
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    expect(segmentEllipseIntersections(segment, { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 0 })).toEqual([]);
  });

  test('tuple 입력과 object 입력은 같은 좌표를 반환한다', () => {
    const segObj = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    const segTuple = [
      [-5, 0],
      [5, 0],
    ] as const;
    const ellipseTuple = [[0, 0], 2, 1] as const;
    expect(segmentEllipseIntersections(segTuple, ellipseTuple)).toEqual(segmentEllipseIntersections(segObj, ellipse));
  });
});

describe('rayEllipseIntersections', () => {
  test('range 안 두 교점을 t 오름차순으로 반환한다', () => {
    // origin (-5,0), direction (+x). 두 교점 (-2,0), (2,0) 모두 t ≥ 0.
    const ray = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    const result = rayEllipseIntersections(ray, ellipse);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBeCloseTo(-2, 12);
    expect(result[1].x).toBeCloseTo(2, 12);
  });

  test('origin이 내부이면 t ≥ 0 exit 한 점만 반환한다', () => {
    // origin (0,0) 내부, direction (+x). exit (2,0)만 t ≥ 0.
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } };
    const out: { x: number; y: number }[] = [];
    const result = rayEllipseIntersectionsInto(out, ray, ellipse);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(2, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('두 교점이 모두 ray 뒤(t < 0)이면 빈 배열을 반환한다', () => {
    // origin (-5,0), direction (-x). 교점들은 모두 t < 0이다.
    const ray = { origin: { x: -5, y: 0 }, direction: { x: -1, y: 0 } };
    expect(rayEllipseIntersections(ray, ellipse)).toEqual([]);
  });

  test('degenerate direction(zero-length)은 빈 배열을 반환한다', () => {
    const ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(rayEllipseIntersections(ray, ellipse)).toEqual([]);
  });

  test('empty ellipse는 빈 배열을 반환한다', () => {
    const ray = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    expect(rayEllipseIntersections(ray, { center: { x: 0, y: 0 }, radiusX: -1, radiusY: 1 })).toEqual([]);
  });

  test('tuple 입력과 object 입력은 같은 좌표를 반환한다', () => {
    const rayObj = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    // RayTuple = readonly [ox, oy, dx, dy]
    const rayTuple = [-5, 0, 1, 0] as const;
    const ellipseTuple = [[0, 0], 2, 1] as const;
    expect(rayEllipseIntersections(rayTuple, ellipseTuple)).toEqual(rayEllipseIntersections(rayObj, ellipse));
  });
});

describe('Into out array 계약', () => {
  test('Into는 기존 out 내용을 clear한 뒤 같은 reference를 반환한다', () => {
    const out = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
      { x: 77, y: 77 },
    ];
    const line = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    const result = infiniteLineEllipseIntersectionsInto(out, line, ellipse);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out).not.toContainEqual({ x: 99, y: 99 });
  });

  test('빈 결과에서도 out을 clear하고 같은 reference를 반환한다', () => {
    const out = [{ x: 99, y: 99 }];
    const line = { origin: { x: -5, y: 2 }, direction: { x: 1, y: 0 } };
    const result = infiniteLineEllipseIntersectionsInto(out, line, ellipse);
    expect(result).toBe(out);
    expect(out).toHaveLength(0);
  });

  test('push된 point는 입력 center object와 다른 reference다', () => {
    const sharedCenter = { x: 0, y: 0 };
    const out: { x: number; y: number }[] = [];
    const ray = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    rayEllipseIntersectionsInto(out, ray, { center: sharedCenter, radiusX: 2, radiusY: 1 });
    for (const p of out) {
      expect(p).not.toBe(sharedCenter);
    }
  });
});

describe('companion fresh array', () => {
  test('companion은 새 배열을 반환하고 Into와 같은 좌표를 반환한다', () => {
    const line = { origin: { x: -5, y: 0 }, direction: { x: 1, y: 0 } };
    const into: { x: number; y: number }[] = [];
    infiniteLineEllipseIntersectionsInto(into, line, ellipse);
    const result = infiniteLineEllipseIntersections(line, ellipse);
    expect(result).not.toBe(into);
    expect(result).toEqual(into);
  });

  test('companion은 호출마다 다른 배열을 반환한다', () => {
    const segment = { a: { x: -5, y: 0 }, b: { x: 5, y: 0 } };
    const first = segmentEllipseIntersections(segment, ellipse);
    const second = segmentEllipseIntersections(segment, ellipse);
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
