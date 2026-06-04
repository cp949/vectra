import { describe, expect, test } from 'vitest';
import { weightedPointOnPolylineInto } from '../../../src/random/weighted-point-on-polyline-into';

describe('weightedPointOnPolylineInto', () => {
  test('짧은 segment weight가 커서 선택이 뒤집힌다(deterministic)', () => {
    // polyline (0,0)-(1,0)-(4,0): seg0 len=1, seg1 len=3
    // weights [4, 0.25] → effective [4, 0.75], total=4.75
    // rng=0.5 → threshold=2.375 < 4 → seg0 선택 (length-uniform이면 같은 rng는 seg1)
    // localFraction=2.375/4=0.59375 → localDistance=0.59375 → (0.59375, 0)
    const out = { x: 0, y: 0 };
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
    ];
    const result = weightedPointOnPolylineInto(out, polyline, [4, 0.25], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0.59375);
    expect(out.y).toBeCloseTo(0);
  });

  test('rng=0은 첫 positive effective segment 시작점을 기록한다', () => {
    // weights [4, 0.25] → seg0 eff>0. rng=0 → threshold=0 → seg0 시작점 (0,0)
    const out = { x: 9, y: 9 };
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
    ];
    const result = weightedPointOnPolylineInto(out, polyline, [4, 0.25], () => 0);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('rng→1은 마지막 positive effective segment 끝 근처를 기록한다', () => {
    // weights [4, 0.25] → 마지막 positive effective는 seg1((1,0)-(4,0))
    const out = { x: 0, y: 0 };
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 4, y: 0 },
    ];
    const result = weightedPointOnPolylineInto(out, polyline, [4, 0.25], () => 0.999999999999);
    expect(result).toBe(true);
    expect(out.x).toBeGreaterThan(3.99);
    expect(out.x).toBeLessThanOrEqual(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('zero weight segment는 선택되지 않는다', () => {
    // polyline (0,0)-(1,0)-(1,1)-(0,1): seg0/1/2 각 len=1
    // weights [0,1,0] → effective [0,1,0]. seg1((1,0)-(1,1), x=1)만 선택
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    for (const u of [0, 0.25, 0.5, 0.999999999999]) {
      const out = { x: -1, y: -1 };
      const result = weightedPointOnPolylineInto(out, polyline, [0, 1, 0], () => u);
      expect(result).toBe(true);
      expect(out.x).toBeCloseTo(1);
      expect(out.y).toBeGreaterThanOrEqual(0);
      expect(out.y).toBeLessThanOrEqual(1);
    }
  });

  test('segment length가 0이면 weight가 양수여도 effective는 0이다', () => {
    // polyline (0,0)-(0,0)-(5,0): seg0 len=0, seg1 len=5
    // weights [10, 1] → effective [0, 5]. seg1만 선택
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 5, y: 0 },
      ],
      [10, 1],
      () => 0.5
    );
    expect(result).toBe(true);
    // threshold=0.5*5=2.5 → seg1 localFraction=0.5 → absolute=0+2.5=2.5 → (2.5,0)
    expect(out.x).toBeCloseTo(2.5);
    expect(out.y).toBeCloseTo(0);
  });

  test('모든 effective weight가 0이면 RangeError, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    expect(() =>
      weightedPointOnPolylineInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        [0],
        () => {
          calls++;
          return 0.5;
        }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('invalid weight(NaN/Infinity/-Infinity/negative)는 RangeError', () => {
    const polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
    for (const bad of [Number.NaN, Infinity, -Infinity, -1]) {
      const out = { x: 7, y: 8 };
      expect(() => weightedPointOnPolylineInto(out, polyline, [bad], () => 0.5)).toThrow(RangeError);
      expect(out).toEqual({ x: 7, y: 8 });
    }
  });

  test('weight length mismatch는 RangeError, RNG 미소비', () => {
    // 2-segment polyline(3 vertex)에 weight 3개 → mismatch
    const out = { x: 7, y: 8 };
    let calls = 0;
    expect(() =>
      weightedPointOnPolylineInto(
        out,
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
        [1, 2, 3],
        () => {
          calls++;
          return 0.5;
        }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('empty polyline → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPolylineInto(out, [], [], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('single-point polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPolylineInto(out, [{ x: 1, y: 2 }], [], () => 0.5);
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('repeated-point polyline(totalLength=0) → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 3, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 3 },
      ],
      [1, 1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('NaN vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: NaN, y: 0 },
        { x: 4, y: 0 },
      ],
      [1, 1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('Infinity vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: Infinity, y: 0 },
        { x: 4, y: 0 },
      ],
      [1, 1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('-Infinity vertex polyline → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: -Infinity, y: 0 },
        { x: 4, y: 0 },
      ],
      [1, 1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('PolylineObjectLike({ points }) 형태 입력을 지원한다', () => {
    const out = { x: 0, y: 0 };
    const result = weightedPointOnPolylineInto(
      out,
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
      },
      [1],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(0);
  });

  test('tuple output 지원', () => {
    const out: [number, number] = [0, 0];
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [1],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out[0]).toBeCloseTo(5);
    expect(out[1]).toBeCloseTo(0);
  });

  test('성공 시 RNG를 정확히 1회 소비한다', () => {
    let calls = 0;
    const out = { x: 0, y: 0 };
    weightedPointOnPolylineInto(
      out,
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

  test('floating-point fallback: threshold가 totalEffective에 닿으면 마지막 positive segment 끝점', () => {
    // contract상 rng<1이지만 부동소수점 경계에서 threshold==totalEffective가 가능하다.
    // rng=()=>1로 weightedSegmentOffset fallback(internal.ts:74-85) 진입을 강제하는 white-box 테스트.
    // (0,0)-(1,0)-(4,0): seg0 len1, seg1 len3. weights [4,0.25] → effective [4,0.75], total=4.75.
    // threshold=4.75 → strict `<` 모두 실패 → fallback이 마지막 positive segment(seg1) 끝점 (4,0).
    const out = { x: 0, y: 0 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 4, y: 0 },
      ],
      [4, 0.25],
      () => 1
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('fallback이 trailing zero-weight segment를 건너뛰고 마지막 positive segment 끝점', () => {
    // (0,0)-(1,0)-(4,0)-(5,0): seg0 len1, seg1 len3, seg2 len1. weights [1,1,0] → effective [1,3,0], total=4.
    // rng=()=>1 → threshold=4 → main loop 미매치 → fallback이 trailing zero-weight seg2를 건너뛰고
    // (tailLength 누적) 마지막 positive segment(seg1) 끝점 offset=4 → (4,0).
    const out = { x: 0, y: 0 };
    const result = weightedPointOnPolylineInto(
      out,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      [1, 1, 0],
      () => 1
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });
});
