/**
 * editor-geometry snap-to-guides 단위 테스트
 *
 * snapPointToGuides 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapPointToGuides } from '../../../src/editor-geometry/snap-to-guides';

describe('editor-geometry - snapPointToGuides', () => {
  test('axis: x guide는 x 좌표를 guide.value로 snap한다', () => {
    // guide x=10, point (12,5), dist = 2
    const result = snapPointToGuides({ x: 12, y: 5 }, [{ axis: 'x', value: 10 }], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(10);
    expect(result.y).toBe(5);
    expect(result.distance).toBeCloseTo(2);
    expect(result.source).toBe('guide');
  });

  test('axis: y guide는 y 좌표를 guide.value로 snap한다', () => {
    // guide y=20, point (7,17), dist = 3
    const result = snapPointToGuides({ x: 7, y: 17 }, [{ axis: 'y', value: 20 }], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(7);
    expect(result.y).toBe(20);
    expect(result.distance).toBeCloseTo(3);
    expect(result.source).toBe('guide');
  });

  test('tolerance 밖이면 snapped: false를 반환한다', () => {
    const result = snapPointToGuides({ x: 20, y: 0 }, [{ axis: 'x', value: 0 }], 5);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(20);
    expect(result.y).toBe(0);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('빈 배열이면 snapped: false를 반환한다', () => {
    const result = snapPointToGuides({ x: 5, y: 5 }, [], 100);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('여러 guide 중 가장 가까운 guide를 선택한다', () => {
    // guide1: x=0 dist=10, guide2: x=8 dist=2
    const result = snapPointToGuides(
      { x: 10, y: 5 },
      [
        { axis: 'x', value: 0 },
        { axis: 'x', value: 8 },
      ],
      15
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(8);
    expect(result.y).toBe(5);
    expect(result.distance).toBeCloseTo(2);
  });

  test('동거리이면 insertion order 우선을 따른다', () => {
    // guide1: x=8 dist=2, guide2: x=12 dist=2
    const result = snapPointToGuides(
      { x: 10, y: 5 },
      [
        { axis: 'x', value: 8 },
        { axis: 'x', value: 12 },
      ],
      5
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(8);
  });

  test('x guide와 y guide가 섞여 있을 때 가장 가까운 것을 선택한다', () => {
    // x=0 dist=10, y=3 dist=2
    const result = snapPointToGuides(
      { x: 10, y: 5 },
      [
        { axis: 'x', value: 0 },
        { axis: 'y', value: 3 },
      ],
      15
    );
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(10);
    expect(result.y).toBe(3);
    expect(result.distance).toBeCloseTo(2);
  });

  test('tuple 형식 point 입력을 처리한다', () => {
    const result = snapPointToGuides([12, 5] as const, [{ axis: 'x', value: 10 }], 5);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(10);
    expect(result.y).toBe(5);
  });

  test('tolerance 경계값 정확히 닿는 guide는 snapped: false를 반환한다', () => {
    // dist === tolerance → strictly less than이므로 miss
    const result = snapPointToGuides({ x: 10, y: 0 }, [{ axis: 'x', value: 5 }], 5);
    expect(result.snapped).toBe(false);
  });
});
