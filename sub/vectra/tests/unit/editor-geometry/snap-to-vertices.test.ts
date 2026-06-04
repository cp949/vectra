/**
 * editor-geometry snap-to-vertices 단위 테스트
 *
 * snapPointToVertices 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapPointToVertices } from '../../../src/editor-geometry/snap-to-vertices';

describe('editor-geometry - snapPointToVertices', () => {
  test('tolerance 이내 가장 가까운 vertex로 snap한다', () => {
    const result = snapPointToVertices(
      { x: 1, y: 0 },
      [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
      ],
      5
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(1);
    expect(result.source).toBe('vertex');
  });

  test('tolerance 밖이면 snapped: false를 반환한다', () => {
    const result = snapPointToVertices({ x: 10, y: 0 }, [{ x: 0, y: 0 }], 5);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(10);
    expect(result.y).toBe(0);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('빈 배열이면 snapped: false를 반환한다', () => {
    const result = snapPointToVertices({ x: 5, y: 5 }, [], 100);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('여러 후보 중 가장 가까운 vertex를 선택한다', () => {
    const result = snapPointToVertices(
      { x: 5, y: 0 },
      [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 9, y: 0 },
      ],
      10
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(4);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(1);
  });

  test('동거리이면 insertion order 우선을 따른다', () => {
    // v1: (0,3) dist 5 — v2: (4,0) dist 5
    const result = snapPointToVertices(
      { x: 3, y: 4 },
      [
        { x: 0, y: 4 },
        { x: 3, y: 7 },
      ],
      10
    );
    expect(result.snapped).toBe(true);
    // 두 vertex 모두 dist = 3, 첫 번째를 유지해야 함
    expect(result.x).toBe(0);
    expect(result.y).toBe(4);
  });

  test('점이 vertex와 정확히 일치하면 distance 0으로 snap한다', () => {
    const result = snapPointToVertices({ x: 3, y: 4 }, [{ x: 3, y: 4 }], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
    expect(result.distance).toBe(0);
  });

  test('tuple 형식 vertex 입력을 처리한다', () => {
    const result = snapPointToVertices([1, 0] as const, [[0, 0] as const, [5, 0] as const], 3);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  test('tolerance 경계값 정확히 닿는 vertex는 snapped: false를 반환한다', () => {
    // dist === tolerance → strictly less than이므로 miss
    const result = snapPointToVertices({ x: 5, y: 0 }, [{ x: 0, y: 0 }], 5);
    expect(result.snapped).toBe(false);
  });

  test('tolerance가 음수이면 모든 vertex가 miss이다', () => {
    // tolerance^2의 양수화로 false-hit가 발생하지 않아야 한다.
    const result = snapPointToVertices({ x: 0, y: 0 }, [{ x: 0, y: 0 }], -5);
    expect(result.snapped).toBe(false);
  });

  test('tolerance가 NaN이면 모든 vertex가 miss이다', () => {
    const result = snapPointToVertices({ x: 0, y: 0 }, [{ x: 0, y: 0 }], Number.NaN);
    expect(result.snapped).toBe(false);
  });
});
