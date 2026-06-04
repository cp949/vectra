import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { pointInPolygonInto } from '../../../src/random/point-in-polygon-into';
import { sequence } from './_geometry-test-helpers';

describe('pointInPolygonInto', () => {
  /** 단위 정사각형 polygon (0~1 범위) */
  const unitSquare = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  test('빈 polygon → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInPolygonInto(out, [], () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('vertex 2개(point-count < 3) → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('collinear vertices(zero-height bounds) → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    // 3점이 collinear → minY === maxY → zero-area bounds
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('collinear diagonal vertices(signedArea === 0) → false, out 미수정, rng 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('NaN vertex → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: NaN, y: 0 },
        { x: 1, y: 1 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('Infinity vertex → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: Infinity, y: 0 },
        { x: 1, y: 1 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('-Infinity vertex → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointInPolygonInto(
      out,
      [
        { x: 0, y: 0 },
        { x: -Infinity, y: 0 },
        { x: 1, y: 1 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('valid convex polygon(4점 rect) → 내부 점 기록 후 true 반환', () => {
    const out = { x: 0, y: 0 };
    // unit square, rng=0.5 → x=0.5, y=0.5, containsPoint=true
    const result = pointInPolygonInto(out, unitSquare, () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0.5);
    expect(out.y).toBeCloseTo(0.5);
  });

  test('concave polygon은 reject 후 다음 inside sample을 기록한다', () => {
    const out = { x: 0, y: 0 };
    const lShape = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 3 },
      { x: 0, y: 3 },
    ];

    const result = pointInPolygonInto(out, lShape, sequence([0.75, 0.75, 0.25, 0.75]));

    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0.75);
    expect(out.y).toBeCloseTo(2.25);
  });

  test('결정론: 같은 seed → 같은 결과', () => {
    const rng1 = createRng('S3-RM-029-pointInPolygonInto-determinism');
    const rng2 = createRng('S3-RM-029-pointInPolygonInto-determinism');
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointInPolygonInto(out1, unitSquare, rng1);
    pointInPolygonInto(out2, unitSquare, rng2);
    expect(out1.x).toBe(out2.x);
    expect(out1.y).toBe(out2.y);
  });

  test('iteration 한도 초과 → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    // rng는 public contract인 [0, 1) 안에 둔다. (0.9, 0.9)는 bbox 안이지만 x + y > 1이라 triangle 밖이다.
    const triangle = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    const result = pointInPolygonInto(out, triangle, () => 0.9);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('area-uniform 통계: 4사분면 비율 ~25% each, tolerance 3%', () => {
    // polygon: 중앙(0,0) 기준 2x2 정사각형
    const square = [
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
    ];
    const rng = createRng('S3-RM-029-pointInPolygonInto');
    const N = 10000;
    const counts = [0, 0, 0, 0]; // [x>=0,y>=0], [x<0,y>=0], [x>=0,y<0], [x<0,y<0]
    const out = { x: 0, y: 0 };
    for (let i = 0; i < N; i++) {
      pointInPolygonInto(out, square, rng);
      if (out.x >= 0 && out.y >= 0) counts[0]++;
      else if (out.x < 0 && out.y >= 0) counts[1]++;
      else if (out.x >= 0 && out.y < 0) counts[2]++;
      else counts[3]++;
    }
    const tolerance = 0.03;
    for (const count of counts) {
      expect(Math.abs(count / N - 0.25)).toBeLessThan(tolerance);
    }
  });

  test('tuple output 지원', () => {
    const out: [number, number] = [0, 0];
    const result = pointInPolygonInto(out, unitSquare, () => 0.5);
    expect(result).toBe(true);
    expect(out[0]).toBeCloseTo(0.5);
    expect(out[1]).toBeCloseTo(0.5);
  });
});
