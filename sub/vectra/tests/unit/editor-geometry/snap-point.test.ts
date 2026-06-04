/**
 * editor-geometry snap-point 단위 테스트
 *
 * snapPoint 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapPoint } from '../../../src/editor-geometry/snap-point';
import type { SnapCandidate } from '../../../src/editor-geometry/types';

describe('editor-geometry - snapPoint', () => {
  test('가장 가까운 candidate로 snap한다', () => {
    const candidates: SnapCandidate[] = [
      { x: 0, y: 0, source: 'grid' },
      { x: 9, y: 0, source: 'vertex' },
    ];
    // point (10,0): dist to (0,0)=10, dist to (9,0)=1
    const result = snapPoint({ x: 10, y: 0 }, candidates);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(9);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(1);
    expect(result.source).toBe('vertex');
  });

  test('빈 candidates는 snapped: false를 반환한다', () => {
    const result = snapPoint({ x: 5, y: 5 }, []);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('tolerance 미지정 시 모든 candidate를 대상으로 snap한다', () => {
    const candidates: SnapCandidate[] = [{ x: 1000, y: 0, source: 'guide' }];
    const result = snapPoint({ x: 0, y: 0 }, candidates);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(1000);
    expect(result.source).toBe('guide');
  });

  test('tolerance 이내 candidate로 snap한다', () => {
    const candidates: SnapCandidate[] = [{ x: 3, y: 0, source: 'segment' }];
    // point (0,0), dist=3, tolerance=5 → hit
    const result = snapPoint({ x: 0, y: 0 }, candidates, { tolerance: 5 });
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(3);
    expect(result.distance).toBeCloseTo(3);
  });

  test('tolerance 밖 candidate는 miss다', () => {
    const candidates: SnapCandidate[] = [{ x: 10, y: 0, source: 'grid' }];
    const result = snapPoint({ x: 0, y: 0 }, candidates, { tolerance: 5 });
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('tolerance 경계값 정확히 닿는 candidate는 miss다', () => {
    // dist === tolerance → strictly less than이므로 miss
    const candidates: SnapCandidate[] = [{ x: 5, y: 0, source: 'grid' }];
    const result = snapPoint({ x: 0, y: 0 }, candidates, { tolerance: 5 });
    expect(result.snapped).toBe(false);
  });

  test('동거리이면 insertion order 우선이다', () => {
    // point (0,0), c1=(3,4) dist=5, c2=(-3,-4) dist=5
    const candidates: SnapCandidate[] = [
      { x: 3, y: 4, source: 'vertex' },
      { x: -3, y: -4, source: 'guide' },
    ];
    const result = snapPoint({ x: 0, y: 0 }, candidates, { tolerance: 10 });
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
    expect(result.source).toBe('vertex');
  });

  test('tuple 형식 point 입력을 처리한다', () => {
    const candidates: SnapCandidate[] = [{ x: 2, y: 0, source: 'grid' }];
    const result = snapPoint([0, 0] as const, candidates);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(2);
  });

  test('miss 시 입력 좌표를 그대로 반환한다', () => {
    const result = snapPoint({ x: 7, y: 3 }, [], { tolerance: 5 });
    expect(result.x).toBe(7);
    expect(result.y).toBe(3);
  });
});
