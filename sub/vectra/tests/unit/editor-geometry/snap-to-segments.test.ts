/**
 * editor-geometry snap-to-segments 단위 테스트
 *
 * snapPointToSegments 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapPointToSegments } from '../../../src/editor-geometry/snap-to-segments';

describe('editor-geometry - snapPointToSegments', () => {
  test('tolerance 이내 segment 위 점으로 snap한다', () => {
    // segment: (0,0)→(10,0), point: (5,3), tolerance: 5
    // closest point: (5,0), distance: 3
    const result = snapPointToSegments({ x: 5, y: 3 }, [{ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(5);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(3);
    expect(result.source).toBe('segment');
  });

  test('tolerance 밖이면 snapped: false를 반환한다', () => {
    // distance: 6, tolerance: 5
    const result = snapPointToSegments({ x: 5, y: 6 }, [{ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }], 5);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(5);
    expect(result.y).toBe(6);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('빈 배열이면 snapped: false를 반환한다', () => {
    const result = snapPointToSegments({ x: 3, y: 4 }, [], 100);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('여러 후보 중 가장 가까운 segment를 선택한다', () => {
    // seg1: (0,0)→(10,0) — closest (5,0), dist 3
    // seg2: (0,10)→(10,10) — closest (5,10), dist 7
    const result = snapPointToSegments(
      { x: 5, y: 3 },
      [
        { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
        { a: { x: 0, y: 10 }, b: { x: 10, y: 10 } },
      ],
      10
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(5);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(3);
  });

  test('동거리이면 insertion order 우선을 따른다', () => {
    // 두 segment 모두 distance = 1 (point가 정확히 같은 거리)
    // seg1: (0,1)→(10,1) — closest (5,1), dist 1
    // seg2: (0,-1)→(10,-1) — closest (5,-1), dist 1
    const result = snapPointToSegments(
      { x: 5, y: 0 },
      [
        { a: { x: 0, y: 1 }, b: { x: 10, y: 1 } },
        { a: { x: 0, y: -1 }, b: { x: 10, y: -1 } },
      ],
      5
    );
    expect(result.snapped).toBe(true);
    // dist < bestDist (strictly less than) — 동거리면 첫 번째 유지
    expect(result.y).toBe(1);
  });

  test('zero-length segment는 시작점으로 snap한다', () => {
    // segment: (3,4)→(3,4), point: (5,4), tolerance: 10
    const result = snapPointToSegments({ x: 5, y: 4 }, [{ a: { x: 3, y: 4 }, b: { x: 3, y: 4 } }], 10);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
    expect(result.distance).toBeCloseTo(2);
  });

  test('tuple 형식 segment 입력을 처리한다', () => {
    const result = snapPointToSegments([5, 3] as const, [[[0, 0] as const, [10, 0] as const]], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(5);
    expect(result.y).toBe(0);
  });

  test('tolerance 경계값 정확히 닿는 point는 snapped: false를 반환한다', () => {
    // dist === tolerance → strictly less than이므로 miss
    const result = snapPointToSegments({ x: 5, y: 5 }, [{ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }], 5);
    expect(result.snapped).toBe(false);
  });

  test('tolerance가 음수이면 모든 segment가 miss이다', () => {
    // tolerance^2의 양수화로 false-hit가 발생하지 않아야 한다.
    const result = snapPointToSegments({ x: 5, y: 0 }, [{ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }], -5);
    expect(result.snapped).toBe(false);
  });

  test('tolerance가 NaN이면 모든 segment가 miss이다', () => {
    const result = snapPointToSegments({ x: 5, y: 0 }, [{ a: { x: 0, y: 0 }, b: { x: 10, y: 0 } }], Number.NaN);
    expect(result.snapped).toBe(false);
  });
});
