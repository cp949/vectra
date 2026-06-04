import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { pointOnPolylineInto } from '../../../src/random/point-on-polyline-into';

describe('pointOnPolylineInto', () => {
  test('수평 3-vertex polyline: rng=0.5 → 중간점 기록, true 반환', () => {
    // polyline: (0,0)-(4,0)-(8,0), totalLength=8, distance=0.5*8=4 → (4,0)
    const out = { x: 0, y: 0 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 8, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('multi-vertex polyline: 결과 점이 어느 segment 위에 있는지 검증', () => {
    // polyline: (0,0)-(1,0)-(1,1)-(0,1), totalLength=3, distance=0.75*3=2.25
    // segment0: (0,0)-(1,0) len=1, segment1: (1,0)-(1,1) len=1, segment2: (1,1)-(0,1) len=1
    // distance=2.25 → segment2에 속함, t=(2.25-2)/1=0.25 → (1-0.25, 1) = (0.75, 1)
    const out = { x: 0, y: 0 };
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const result = pointOnPolylineInto(out, polyline, () => 0.75);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0.75);
    expect(out.y).toBeCloseTo(1);
  });

  test('open segment model: closing edge를 implicit하게 포함하지 않는다', () => {
    const out = { x: 0, y: 0 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
      ],
      () => 6 / 7
    );

    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(2);
  });

  test('PolylineObjectLike({ points }) 형태 입력을 지원한다', () => {
    const out = { x: 0, y: 0 };
    const result = pointOnPolylineInto(
      out,
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
      },
      () => 0.5
    );

    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('tuple output 지원', () => {
    const out: [number, number] = [0, 0];
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      () => 0.5
    );

    expect(result).toBe(true);
    expect(out[0]).toBeCloseTo(5);
    expect(out[1]).toBeCloseTo(0);
  });

  test('length-uniform 통계: 긴 segment에 ~75% sample, tolerance 3%', () => {
    // polyline: (0,0)-(1,0)-(4,0), segment0 len=1, segment1 len=3, totalLength=4
    // 통계적으로 sample의 ~75%가 segment1(1~4 구간)에 속해야 한다
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
    ];
    const rng = createRng('S3-RM-029-pointOnPolylineInto');
    const N = 10000;
    let longSegCount = 0;
    const out = { x: 0, y: 0 };
    for (let i = 0; i < N; i++) {
      pointOnPolylineInto(out, polyline, rng);
      if (out.x > 1) longSegCount++;
    }
    expect(Math.abs(longSegCount / N - 0.75)).toBeLessThan(0.03);
  });

  test('empty polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = pointOnPolylineInto(out, [], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('single-point polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPolylineInto(out, [{ x: 1, y: 2 }], () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('동일 vertex repeated polyline(totalLength=0) → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 3, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 3 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('NaN vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: NaN, y: 0 },
        { x: 4, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('Infinity vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: Infinity, y: 0 },
        { x: 4, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('-Infinity vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: -Infinity, y: 0 },
        { x: 4, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('seed 기반 deterministic: 같은 seed → 같은 결과, RNG 소비 1회', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const rng1 = createRng('S3-RM-029-pointOnPolylineInto-determinism');
    const rng2 = createRng('S3-RM-029-pointOnPolylineInto-determinism');
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointOnPolylineInto(out1, polyline, rng1);
    pointOnPolylineInto(out2, polyline, rng2);
    expect(out1.x).toBe(out2.x);
    expect(out1.y).toBe(out2.y);

    // RNG 소비 1회 검증
    let calls = 0;
    const countingRng = () => {
      calls++;
      return 0.3;
    };
    const out3 = { x: 0, y: 0 };
    pointOnPolylineInto(out3, polyline, countingRng);
    expect(calls).toBe(1);
  });
});
