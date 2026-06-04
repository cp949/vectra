/**
 * triangle containsPoints 단위 테스트
 *
 * 대상 함수:
 *   containsPoints
 */
import { describe, expect, test } from 'vitest';
import { containsPoints } from '../../../src/triangle/contains-points';

// ─── 공통 fixture ─────────────────────────────────────────────────────────────

/** CCW triangle: a(0,0) b(4,0) c(0,4) */
const ccw = { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } };

/** collinear(degenerate) triangle: area=0 */
const degenerate = { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } };

// ─── containsPoints ───────────────────────────────────────────────────────────

describe('containsPoints', () => {
  test('모든 point가 내부에 있으면 true를 반환한다', () => {
    expect(
      containsPoints(ccw, [
        { x: 1, y: 1 },
        { x: 0.5, y: 0.5 },
      ])
    ).toBe(true);
  });

  test('edge 또는 vertex 위 point가 포함되어도 true를 반환한다', () => {
    expect(
      containsPoints(ccw, [
        { x: 2, y: 0 }, // a-b edge
        { x: 0, y: 0 }, // vertex a
        { x: 1, y: 1 }, // interior
      ])
    ).toBe(true);
  });

  test('하나라도 외부 point가 있으면 false를 반환한다', () => {
    expect(
      containsPoints(ccw, [
        { x: 1, y: 1 },
        { x: 5, y: 5 }, // outside
      ])
    ).toBe(false);
  });

  test('outside point에서 short-circuit한다: 이후 point의 getter를 호출하지 않는다', () => {
    const poisoned: { x: number; y: number } = {
      get x(): number {
        throw new Error('short-circuit 실패: 이후 point를 읽었다');
      },
      get y(): number {
        throw new Error('short-circuit 실패: 이후 point를 읽었다');
      },
    };
    expect(containsPoints(ccw, [{ x: 5, y: 5 }, poisoned])).toBe(false);
  });

  test('빈 배열은 true를 반환한다', () => {
    expect(containsPoints(ccw, [])).toBe(true);
  });

  test('TriangleLike tuple과 XYInput tuple point 배열을 처리한다', () => {
    const tupleTri = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 4 },
    ] as const;
    const tuplePoints = [[1, 1] as const, [0.5, 0.5] as const];
    expect(containsPoints(tupleTri, tuplePoints)).toBe(true);
  });

  test('epsilon > 0이면 edge 근방 point를 boundary로 인정한다', () => {
    // x: -0.05는 epsilon=0에서 외부이고, epsilon=0.1에서 내부
    expect(containsPoints(ccw, [{ x: -0.05, y: 2 }], 0)).toBe(false);
    expect(containsPoints(ccw, [{ x: -0.05, y: 2 }], 0.1)).toBe(true);
  });

  test('degenerate triangle과 non-empty points는 false를 반환한다', () => {
    expect(containsPoints(degenerate, [{ x: 1, y: 0 }])).toBe(false);
  });

  test('NaN point가 포함되면 false를 반환한다', () => {
    expect(containsPoints(ccw, [{ x: Number.NaN, y: 1 }])).toBe(false);
  });

  test('Infinity point가 포함되면 false를 반환한다', () => {
    expect(containsPoints(ccw, [{ x: Infinity, y: 1 }])).toBe(false);
  });

  test('-Infinity point가 포함되면 false를 반환한다', () => {
    expect(containsPoints(ccw, [{ x: 1, y: -Infinity }])).toBe(false);
  });
});
