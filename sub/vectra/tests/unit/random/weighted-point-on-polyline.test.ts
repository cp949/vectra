import { describe, expect, test } from 'vitest';
import { weightedPointOnPolyline } from '../../../src/random/weighted-point-on-polyline';
import { weightedPointOnPolylineInto } from '../../../src/random/weighted-point-on-polyline-into';
import { sequence } from './_geometry-test-helpers';

describe('weightedPointOnPolyline (allocating companion)', () => {
  test('정상 polyline → { x, y } 반환, Into와 동일 결과', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
    ];
    const result = weightedPointOnPolyline(polyline, [4, 0.25], () => 0.5);
    expect(result).toBeDefined();
    if (result !== undefined) {
      const out = { x: 0, y: 0 };
      weightedPointOnPolylineInto(out, polyline, [4, 0.25], () => 0.5);
      expect(result.x).toBeCloseTo(out.x);
      expect(result.y).toBeCloseTo(out.y);
    }
  });

  test('degenerate(empty polyline) → undefined', () => {
    const result = weightedPointOnPolyline([], [], () => 0.5);
    expect(result).toBeUndefined();
  });

  test('all-zero effective weight는 RangeError', () => {
    expect(() =>
      weightedPointOnPolyline(
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        [0],
        () => 0.5
      )
    ).toThrow(RangeError);
  });

  test('매번 새 object 반환', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const r1 = weightedPointOnPolyline(polyline, [1], () => 0.5);
    const r2 = weightedPointOnPolyline(polyline, [1], () => 0.5);
    expect(r1).not.toBe(r2);
  });

  test('sequence rng로 weight 비례 선택을 확인한다', () => {
    // 통계 대신 deterministic: weights [0,1,0]은 seg1만 선택
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const result = weightedPointOnPolyline(polyline, [0, 1, 0], sequence([0.5]));
    expect(result).toBeDefined();
    if (result !== undefined) {
      expect(result.x).toBeCloseTo(1);
    }
  });

  test('성공 시 RNG를 정확히 1회 소비한다', () => {
    let calls = 0;
    weightedPointOnPolyline(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.3;
      }
    );
    expect(calls).toBe(1);
  });

  test('non-finite vertex → undefined, RNG 미소비', () => {
    let calls = 0;
    const result = weightedPointOnPolyline(
      [
        { x: 0, y: 0 },
        { x: NaN, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBeUndefined();
    expect(calls).toBe(0);
  });
});
