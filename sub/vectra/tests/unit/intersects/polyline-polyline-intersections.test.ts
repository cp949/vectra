/**
 * polyline × polyline 교점 collection helper 단위 테스트.
 *
 * S12-RM-010: `polylinePolylineIntersectionsInto` / `polylinePolylineIntersections`가 두 open path
 * boundary의 교점을 subject segment index 오름차순 + segment-local `t` 오름차순으로 노출하는지
 * 검증한다. single crossing, multi-segment ordering, shared vertex dedupe, collinear overlap
 * start/end, overlap 수렴 dedupe, disjoint, empty/single-point, zero-length segment skip,
 * non-finite empty, tuple/object 동등성, out array clear/reference 보존, companion fresh object를
 * 다룬다.
 */

import { describe, expect, test } from 'vitest';
import { polylinePolylineIntersections } from '../../../src/intersects/polyline-polyline-intersections';
import { polylinePolylineIntersectionsInto } from '../../../src/intersects/polyline-polyline-intersections-into';

/** 결과 point를 [x, y] tuple 배열로 변환해 좌표 비교를 단순화한다. */
function toXY(points: readonly { x: number; y: number }[]): [number, number][] {
  return points.map((p) => [p.x, p.y]);
}

describe('polylinePolylineIntersections — crossing / ordering', () => {
  test('single crossing은 교점 1점을 반환한다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, 5],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('두 subject segment가 target을 각각 교차하면 subject segment index 오름차순이다', () => {
    // subject seg0 (0,0)→(10,0), seg1 (10,0)→(10,10)
    const subject = [
      [0, 0],
      [10, 0],
      [10, 10],
    ] as const;
    // target seg0 (5,-5)→(5,5)는 subject seg0을 (5,0)에서, target seg1 (5,5)→(15,5)는
    // subject seg1을 (10,5)에서 교차한다.
    const target = [
      [5, -5],
      [5, 5],
      [15, 5],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(toXY(result)).toEqual([
      [5, 0],
      [10, 5],
    ]);
  });

  test('같은 subject segment에서 두 target segment 교차는 subject segment-local t 오름차순이다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    // target U자: seg0 (2,-2)→(2,2)가 (2,0), seg2 (8,2)→(8,-2)가 (8,0)을 교차한다.
    const target = [
      [2, -2],
      [2, 2],
      [8, 2],
      [8, -2],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(toXY(result)).toEqual([
      [2, 0],
      [8, 0],
    ]);
  });

  test('target이 큰 t 교점을 먼저 보고해도 subject segment-local t 오름차순으로 정렬한다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    // target seg0 (8,2)→(8,-2)가 (8,0) t=0.8을 먼저, seg2 (2,-2)→(2,2)가 (2,0) t=0.2를 나중에
    // 보고하지만 결과는 t 오름차순이어야 한다.
    const target = [
      [8, 2],
      [8, -2],
      [2, -2],
      [2, 2],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(toXY(result)).toEqual([
      [2, 0],
      [8, 0],
    ]);
  });
});

describe('polylinePolylineIntersections — dedupe / overlap', () => {
  test('인접 subject segment가 공유 vertex에서 같은 target 교점을 보고하면 1점으로 dedupe한다', () => {
    // subject collinear: seg0 (0,0)→(5,0) endpoint, seg1 (5,0)→(10,0) start가 모두 (5,0)이다.
    const subject = [
      [0, 0],
      [5, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, 5],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('collinear overlap은 clipped start/end 두 점을 반환한다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [4, 0],
      [14, 0],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(toXY(result)).toEqual([
      [4, 0],
      [10, 0],
    ]);
  });

  test('collinear segment가 한 점에서만 닿으면 overlap이 1점으로 수렴한다', () => {
    const subject = [
      [0, 0],
      [5, 0],
    ] as const;
    const target = [
      [5, 0],
      [10, 0],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('target이 subject segment에 완전히 포함되면 overlap이 내부 두 점이다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [3, 0],
      [7, 0],
    ] as const;
    expect(toXY(polylinePolylineIntersections(subject, target))).toEqual([
      [3, 0],
      [7, 0],
    ]);
  });

  test('collinear overlap이 subject vertex를 가로지르면 공유 vertex가 1점으로 dedupe된다', () => {
    // subject seg0 (0,0)→(5,0)와 target (2,0)→(8,0)의 overlap은 (2,0)~(5,0), seg1 (5,0)→(10,0)와의
    // overlap은 (5,0)~(8,0)이다. 공유 vertex (5,0)은 dedupe로 1점만 남아 [2,0],[5,0],[8,0]이 된다.
    const subject = [
      [0, 0],
      [5, 0],
      [10, 0],
    ] as const;
    const target = [
      [2, 0],
      [8, 0],
    ] as const;
    expect(toXY(polylinePolylineIntersections(subject, target))).toEqual([
      [2, 0],
      [5, 0],
      [8, 0],
    ]);
  });

  test('custom epsilon은 가까운 두 교점을 1점으로 dedupe한다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    // target seg0이 (5,0), seg2가 (5.05,0)을 교차한다. 두 교점은 0.05 떨어져 있다.
    const target = [
      [5, -1],
      [5, 1],
      [5.05, 1],
      [5.05, -1],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toHaveLength(2);
    expect(polylinePolylineIntersections(subject, target, 0.1)).toHaveLength(1);
  });
});

describe('polylinePolylineIntersections — empty / degenerate', () => {
  test('disjoint polyline은 빈 배열을 반환한다', () => {
    const subject = [
      [0, 0],
      [1, 0],
    ] as const;
    const target = [
      [0, 5],
      [1, 5],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toEqual([]);
  });

  test('empty polyline은 빈 배열을 반환한다', () => {
    expect(polylinePolylineIntersections([], [])).toEqual([]);
  });

  test('single-point polyline은 빈 배열을 반환한다', () => {
    const subject = [[0, 0]] as const;
    const target = [
      [0, -5],
      [0, 5],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toEqual([]);
  });

  test('zero-length segment는 건너뛰고 valid segment 결과만 반환한다', () => {
    // subject seg0 (0,0)→(0,0)은 zero-length, seg1 (0,0)→(10,0)이 valid다.
    const subject = [
      [0, 0],
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, -5],
      [5, 5],
    ] as const;
    const result = polylinePolylineIntersections(subject, target);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBeCloseTo(5, 12);
    expect(result[0].y).toBeCloseTo(0, 12);
  });

  test('zero-length segment만 있는 polyline은 빈 배열을 반환한다', () => {
    const subject = [
      [3, 3],
      [3, 3],
    ] as const;
    const target = [
      [0, 0],
      [10, 0],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('subject 좌표 %s는 빈 배열을 반환한다', (_label, bad) => {
    const subject = [
      [0, 0],
      [bad, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, 5],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toEqual([]);
  });

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('target 좌표 %s는 빈 배열을 반환한다', (_label, bad) => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, bad],
    ] as const;
    expect(polylinePolylineIntersections(subject, target)).toEqual([]);
  });
});

describe('polylinePolylineIntersections — 입력 형식 / reference', () => {
  test('tuple 입력과 object 입력은 같은 결과를 반환한다', () => {
    const subjectTuple = [
      [0, 0],
      [10, 0],
      [10, 10],
    ] as const;
    const targetTuple = [
      [5, -5],
      [5, 5],
      [15, 5],
    ] as const;
    const subjectObj = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    const targetObj = [
      { x: 5, y: -5 },
      { x: 5, y: 5 },
      { x: 15, y: 5 },
    ];
    expect(polylinePolylineIntersections(subjectTuple, targetTuple)).toEqual(
      polylinePolylineIntersections(subjectObj, targetObj)
    );
  });

  test('points field를 가진 object polyline 입력도 동일하게 처리한다', () => {
    const subject = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    };
    const target = {
      points: [
        { x: 5, y: -5 },
        { x: 5, y: 5 },
      ],
    };
    const result = polylinePolylineIntersections(subject, target);
    expect(toXY(result)).toEqual([[5, 0]]);
  });

  test('subject와 target이 같은 object여도 입력 point를 재사용하지 않는다', () => {
    const shared = { x: 5, y: 0 };
    const subject = [{ x: 0, y: 0 }, shared, { x: 10, y: 0 }];
    const target = [{ x: 5, y: -5 }, shared, { x: 5, y: 5 }];
    const result = polylinePolylineIntersections(subject, target);
    for (const p of result) {
      expect(p).not.toBe(shared);
    }
  });
});

describe('polylinePolylineIntersectionsInto', () => {
  test('기존 out 내용을 clear하고 같은 outPoints reference를 반환한다', () => {
    const out = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, 5],
    ] as const;
    const result = polylinePolylineIntersectionsInto(out, subject, target);
    expect(result).toBe(out);
    expect(out).toHaveLength(1);
    expect(out).not.toContainEqual({ x: 99, y: 99 });
  });

  test('outPoints가 subject polyline array와 같아도 clear 전에 입력 좌표를 보존한다', () => {
    const subject = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const target = [
      { x: 5, y: -5 },
      { x: 5, y: 5 },
    ];

    const result = polylinePolylineIntersectionsInto(subject, subject, target);

    expect(result).toBe(subject);
    expect(toXY(result)).toEqual([[5, 0]]);
  });

  test('outPoints가 target polyline points array와 같아도 clear 전에 입력 좌표를 보존한다', () => {
    const subject = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const target = {
      points: [
        { x: 5, y: -5 },
        { x: 5, y: 5 },
      ],
    };

    const result = polylinePolylineIntersectionsInto(target.points, subject, target);

    expect(result).toBe(target.points);
    expect(toXY(result)).toEqual([[5, 0]]);
  });

  test('companion은 Into와 같은 좌표를 새 배열과 새 nested object로 반환한다', () => {
    const subject = [
      [0, 0],
      [10, 0],
    ] as const;
    const target = [
      [5, -5],
      [5, 5],
    ] as const;
    const into: { x: number; y: number }[] = [];
    polylinePolylineIntersectionsInto(into, subject, target);
    const result = polylinePolylineIntersections(subject, target);
    expect(result).not.toBe(into);
    expect(result).toEqual(into);
    expect(result[0]).not.toBe(into[0]);
  });

  test('교점 없으면 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const subject = [
      [0, 0],
      [1, 0],
    ] as const;
    const target = [
      [0, 5],
      [1, 5],
    ] as const;
    expect(polylinePolylineIntersectionsInto(out, subject, target)).toHaveLength(0);
  });
});
