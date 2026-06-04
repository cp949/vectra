/**
 * circle × polyline 교점 collection helper 단위 테스트.
 *
 * S12-RM-010: `circlePolylineIntersectionsInto` / `circlePolylineIntersections`가 circle
 * circumference와 open path의 교점을 polyline segment index 오름차순 + segment-local `t` 오름차순으로
 * 노출하는지 검증한다. proper two-point ordering, tangent 1점, multi-segment ordering, shared circle
 * point dedupe, segment-inside-circle empty, disjoint, empty/single-point, zero-length segment skip,
 * empty circle, non-finite empty, tuple/object 동등성, out array clear/reference 보존, companion
 * fresh object를 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { circlePolylineIntersections } from '../../../src/intersects/circle-polyline-intersections';
import { circlePolylineIntersectionsInto } from '../../../src/intersects/circle-polyline-intersections-into';

/** 결과 point를 [x, y] tuple 배열로 변환해 좌표 비교를 단순화한다. */
function toXY(points: readonly { x: number; y: number }[]): [number, number][] {
  return points.map((p) => [p.x, p.y]);
}

const UNIT_CIRCLE = { center: { x: 0, y: 0 }, radius: 5 };

describe('circlePolylineIntersections — crossing / tangent / ordering', () => {
  test('proper two-point crossing은 segment-local t 오름차순 두 점을 반환한다', () => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBeCloseTo(-5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
    expect(result[1].x).toBeCloseTo(5, 12);
    expect(result[1].y).toBeCloseTo(0, 12);
  });

  test('tangent는 접점 1점을 반환한다', () => {
    const polyline = [
      [-10, 5],
      [10, 5],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(0, 12);
    expect(result[0].y).toBeCloseTo(5, 12);
  });

  test('두 polyline segment가 circle을 교차하면 polyline segment index 오름차순이다', () => {
    // seg0 (-10,0)→(0,0)은 (-5,0)에서, seg1 (0,0)→(0,10)은 (0,5)에서 circumference를 만난다.
    const polyline = [
      [-10, 0],
      [0, 0],
      [0, 10],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(toXY(result)).toEqual([
      [-5, 0],
      [0, 5],
    ]);
  });

  test('segment 한 끝이 circle 안이면 두 root 중 range 안 1점만 반환한다', () => {
    // (0,0)은 disk 내부, (10,0)은 밖. x=5만 segment range 안, x=-5는 range 밖이다.
    const result = circlePolylineIntersections(UNIT_CIRCLE, [
      [0, 0],
      [10, 0],
    ] as const);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('segment 방향을 뒤집어도 range 안 1점은 동일하다', () => {
    const result = circlePolylineIntersections(UNIT_CIRCLE, [
      [10, 0],
      [0, 0],
    ] as const);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('tangent 접점이 segment range 밖이면 빈 배열이다', () => {
    // y=5는 circle에 (0,5)에서 접하지만 segment x∈[10,20]은 접점 x=0을 포함하지 않는다.
    expect(
      circlePolylineIntersections(UNIT_CIRCLE, [
        [10, 5],
        [20, 5],
      ] as const)
    ).toEqual([]);
  });

  test('한 segment 2점과 다른 segment 2점이 segment-index 후 segment-local t 순으로 정렬된다', () => {
    // seg0 (-10,0)→(10,0)은 (-5,0),(5,0). seg2 (10,3)→(-10,3)은 (4,3),(-4,3)을 t 오름차순으로
    // 보고한다(x는 감소하지만 t는 증가). seg1 (10,0)→(10,3)은 circle을 만나지 않는다.
    const polyline = [
      [-10, 0],
      [10, 0],
      [10, 3],
      [-10, 3],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(result).toHaveLength(4);
    expect(result[0].x).toBeCloseTo(-5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
    expect(result[1].x).toBeCloseTo(5, 12);
    expect(result[1].y).toBeCloseTo(0, 12);
    expect(result[2].x).toBeCloseTo(4, 12);
    expect(result[2].y).toBeCloseTo(3, 12);
    expect(result[3].x).toBeCloseTo(-4, 12);
    expect(result[3].y).toBeCloseTo(3, 12);
  });

  test('custom epsilon은 near-miss를 tangent 1점으로 떨어뜨린다', () => {
    // y=5.001은 circle(r=5) 밖이라 default epsilon에서는 discriminant가 음수로 교점이 없다. epsilon을
    // 키우면 살짝 음수인 discriminant가 |disc| ≤ epsilon² tangent band 안에 들어 접점 1점이 된다.
    const polyline = [
      [-10, 5.001],
      [10, 5.001],
    ] as const;
    expect(circlePolylineIntersections(UNIT_CIRCLE, polyline)).toHaveLength(0);
    const hit = circlePolylineIntersections(UNIT_CIRCLE, polyline, 0.1);
    expect(hit).toHaveLength(1);
    expect(hit[0].x).toBeCloseTo(0, 9);
    expect(hit[0].y).toBeCloseTo(5.001, 9);
  });
});

describe('circlePolylineIntersections — dedupe / containment', () => {
  test('인접 segment가 같은 circle point를 보고하면 1점으로 dedupe한다', () => {
    // x=5 직선은 circle에 (5,0)에서 접한다. seg0 끝점과 seg1 시작점이 모두 (5,0)을 보고한다.
    const polyline = [
      [5, -5],
      [5, 0],
      [5, 5],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('segment가 circle disk 내부에 완전히 포함되면 빈 배열을 반환한다', () => {
    const polyline = [
      [-1, 0],
      [1, 0],
    ] as const;
    expect(circlePolylineIntersections(UNIT_CIRCLE, polyline)).toEqual([]);
  });
});

describe('circlePolylineIntersections — empty / degenerate', () => {
  test('disjoint polyline은 빈 배열을 반환한다', () => {
    const polyline = [
      [10, 10],
      [20, 20],
    ] as const;
    expect(circlePolylineIntersections(UNIT_CIRCLE, polyline)).toEqual([]);
  });

  test('empty polyline은 빈 배열을 반환한다', () => {
    expect(circlePolylineIntersections(UNIT_CIRCLE, [])).toEqual([]);
  });

  test('single-point polyline은 빈 배열을 반환한다', () => {
    expect(circlePolylineIntersections(UNIT_CIRCLE, [[5, 0]])).toEqual([]);
  });

  test('zero-length segment는 건너뛰고 valid segment 결과만 반환한다', () => {
    // seg0 (8,0)→(8,0) zero-length skip, seg1 (8,0)→(-8,0)이 (5,0),(-5,0)을 만난다.
    const polyline = [
      [8, 0],
      [8, 0],
      [-8, 0],
    ] as const;
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(toXY(result)).toEqual([
      [5, 0],
      [-5, 0],
    ]);
  });

  test('zero-length segment만 있는 polyline은 빈 배열을 반환한다', () => {
    const polyline = [
      [5, 0],
      [5, 0],
    ] as const;
    expect(circlePolylineIntersections(UNIT_CIRCLE, polyline)).toEqual([]);
  });

  test('radius 0인 empty circle은 빈 배열을 반환한다', () => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    expect(circlePolylineIntersections({ center: { x: 0, y: 0 }, radius: 0 }, polyline)).toEqual([]);
  });

  test('radius 음수인 empty circle은 빈 배열을 반환한다', () => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    expect(circlePolylineIntersections({ center: { x: 0, y: 0 }, radius: -1 }, polyline)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('circle center.x %s는 빈 배열을 반환한다', (_label, bad) => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    expect(circlePolylineIntersections({ center: { x: bad, y: 0 }, radius: 5 }, polyline)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('circle center.y %s는 빈 배열을 반환한다', (_label, bad) => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    expect(circlePolylineIntersections({ center: { x: 0, y: bad }, radius: 5 }, polyline)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('circle radius %s는 빈 배열을 반환한다', (_label, bad) => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    expect(circlePolylineIntersections({ center: { x: 0, y: 0 }, radius: bad }, polyline)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('polyline 좌표 %s는 빈 배열을 반환한다', (_label, bad) => {
    const polyline = [
      [-10, 0],
      [10, bad],
    ] as const;
    expect(circlePolylineIntersections(UNIT_CIRCLE, polyline)).toEqual([]);
  });
});

describe('circlePolylineIntersections — 입력 형식 / reference', () => {
  test('tuple 입력과 object 입력은 같은 결과를 반환한다', () => {
    const polylineTuple = [
      [-10, 0],
      [0, 0],
      [0, 10],
    ] as const;
    const circleTuple = [[0, 0], 5] as const;
    const polylineObj = [
      { x: -10, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    ];
    expect(circlePolylineIntersections(circleTuple, polylineTuple)).toEqual(
      circlePolylineIntersections(UNIT_CIRCLE, polylineObj)
    );
  });

  test('points field를 가진 object polyline 입력도 동일하게 처리한다', () => {
    const polyline = {
      points: [
        { x: -10, y: 0 },
        { x: 10, y: 0 },
      ],
    };
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(toXY(result)).toEqual([
      [-5, 0],
      [5, 0],
    ]);
  });

  test('push된 point는 입력 center object와 다른 reference다', () => {
    const sharedCenter = { x: 0, y: 0 };
    const polyline = [
      { x: -10, y: 0 },
      { x: 10, y: 0 },
    ];
    const result = circlePolylineIntersections({ center: sharedCenter, radius: 5 }, polyline);
    for (const p of result) {
      expect(p).not.toBe(sharedCenter);
    }
  });
});

describe('circlePolylineIntersectionsInto', () => {
  test('기존 out 내용을 clear하고 같은 outPoints reference를 반환한다', () => {
    const out = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    const result = circlePolylineIntersectionsInto(out, UNIT_CIRCLE, polyline);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out).not.toContainEqual({ x: 99, y: 99 });
  });

  test('outPoints가 polyline array와 같아도 clear 전에 입력 좌표를 보존한다', () => {
    const polyline = [
      { x: -10, y: 0 },
      { x: 10, y: 0 },
    ];

    const result = circlePolylineIntersectionsInto(polyline, UNIT_CIRCLE, polyline);

    expect(result).toBe(polyline);
    expect(toXY(result)).toEqual([
      [-5, 0],
      [5, 0],
    ]);
  });

  test('companion은 Into와 같은 좌표를 새 배열과 새 nested object로 반환한다', () => {
    const polyline = [
      [-10, 0],
      [10, 0],
    ] as const;
    const into: { x: number; y: number }[] = [];
    circlePolylineIntersectionsInto(into, UNIT_CIRCLE, polyline);
    const result = circlePolylineIntersections(UNIT_CIRCLE, polyline);
    expect(result).not.toBe(into);
    expect(result).toEqual(into);
    expect(result[0]).not.toBe(into[0]);
  });
});
