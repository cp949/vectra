/**
 * editor-geometry magnetic-snap 단위 테스트
 *
 * magneticSnapInto, magneticSnap 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { magneticSnap } from '../../../src/editor-geometry/magnetic-snap';
import { magneticSnapInto } from '../../../src/editor-geometry/magnetic-snap-into';
import type { SnapCandidate } from '../../../src/editor-geometry/types';

describe('editor-geometry - magneticSnapInto', () => {
  test('radius 이내 가장 가까운 candidate를 out에 기록하고 true를 반환한다', () => {
    const candidates: SnapCandidate[] = [
      { x: 0, y: 0, source: 'grid' },
      { x: 9, y: 0, source: 'vertex' },
    ];
    const out = { x: 0, y: 0 };
    const hit = magneticSnapInto(out, { x: 10, y: 0 }, candidates, 15);
    expect(hit).toBe(true);
    expect(out.x).toBe(9);
    expect(out.y).toBe(0);
  });

  test('radius 밖이면 out을 수정하지 않고 false를 반환한다', () => {
    const candidates: SnapCandidate[] = [{ x: 20, y: 0, source: 'grid' }];
    const out = { x: 5, y: 5 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, 10);
    expect(hit).toBe(false);
    expect(out.x).toBe(5);
    expect(out.y).toBe(5);
  });

  test('radius 경계값 정확히 닿으면 miss다', () => {
    // dist === radius → strictly less than이므로 miss
    const candidates: SnapCandidate[] = [{ x: 5, y: 0, source: 'grid' }];
    const out = { x: 99, y: 99 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, 5);
    expect(hit).toBe(false);
    expect(out.x).toBe(99);
  });

  test('out === point aliasing이 안전하다', () => {
    const candidates: SnapCandidate[] = [{ x: 3, y: 4, source: 'vertex' }];
    const pt = { x: 0, y: 0 };
    // out과 point가 같은 object
    const hit = magneticSnapInto(pt, pt, candidates, 10);
    expect(hit).toBe(true);
    expect(pt.x).toBe(3);
    expect(pt.y).toBe(4);
  });

  test('동거리이면 insertion order 우선이다', () => {
    // point (0,0), c1=(3,4) dist=5, c2=(-3,-4) dist=5
    const candidates: SnapCandidate[] = [
      { x: 3, y: 4, source: 'vertex' },
      { x: -3, y: -4, source: 'guide' },
    ];
    const out = { x: 0, y: 0 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, 10);
    expect(hit).toBe(true);
    expect(out.x).toBe(3);
    expect(out.y).toBe(4);
  });

  test('tuple out에 기록한다', () => {
    const candidates: SnapCandidate[] = [{ x: 2, y: 3, source: 'grid' }];
    const out: [number, number] = [0, 0];
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, 10);
    expect(hit).toBe(true);
    expect(out[0]).toBe(2);
    expect(out[1]).toBe(3);
  });

  test('빈 candidates면 out을 수정하지 않고 false를 반환한다', () => {
    const out = { x: 1, y: 2 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, [], 100);
    expect(hit).toBe(false);
    expect(out.x).toBe(1);
    expect(out.y).toBe(2);
  });

  test('radius가 음수이면 out을 수정하지 않고 false를 반환한다', () => {
    const candidates: SnapCandidate[] = [{ x: 0, y: 0, source: 'grid' }];
    const out = { x: 7, y: 8 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, -5);
    expect(hit).toBe(false);
    expect(out.x).toBe(7);
    expect(out.y).toBe(8);
  });

  test('radius가 NaN이면 false를 반환한다', () => {
    const candidates: SnapCandidate[] = [{ x: 0, y: 0, source: 'grid' }];
    const out = { x: 0, y: 0 };
    const hit = magneticSnapInto(out, { x: 0, y: 0 }, candidates, Number.NaN);
    expect(hit).toBe(false);
  });
});

describe('editor-geometry - magneticSnap', () => {
  test('radius 이내 가장 가까운 candidate로 snap한 결과를 반환한다', () => {
    const candidates: SnapCandidate[] = [
      { x: 0, y: 0, source: 'grid' },
      { x: 9, y: 0, source: 'vertex' },
    ];
    const result = magneticSnap({ x: 10, y: 0 }, candidates, 15);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(9);
    expect(result.y).toBe(0);
    expect(result.distance).toBeCloseTo(1);
    expect(result.source).toBe('vertex');
  });

  test('hit 없으면 snapped: false, 입력 좌표, distance: Infinity를 반환한다', () => {
    const candidates: SnapCandidate[] = [{ x: 100, y: 0, source: 'grid' }];
    const result = magneticSnap({ x: 0, y: 0 }, candidates, 5);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('빈 candidates면 snapped: false를 반환한다', () => {
    const result = magneticSnap({ x: 3, y: 7 }, [], 100);
    expect(result.snapped).toBe(false);
    expect(result.x).toBe(3);
    expect(result.y).toBe(7);
    expect(result.distance).toBe(Infinity);
    expect(result.source).toBe('none');
  });

  test('동거리이면 insertion order 우선이다', () => {
    const candidates: SnapCandidate[] = [
      { x: 3, y: 4, source: 'vertex' },
      { x: -3, y: -4, source: 'guide' },
    ];
    const result = magneticSnap({ x: 0, y: 0 }, candidates, 10);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
    expect(result.source).toBe('vertex');
  });

  test('tuple 형식 point 입력을 처리한다', () => {
    const candidates: SnapCandidate[] = [{ x: 2, y: 0, source: 'segment' }];
    const result = magneticSnap([0, 0] as const, candidates, 10);
    expect(result.snapped).toBe(true);
    expect(result.x).toBe(2);
  });

  test('radius 경계값 정확히 닿으면 miss다', () => {
    const candidates: SnapCandidate[] = [{ x: 5, y: 0, source: 'grid' }];
    const result = magneticSnap({ x: 0, y: 0 }, candidates, 5);
    expect(result.snapped).toBe(false);
  });

  test('radius가 음수이면 snapped: false를 반환한다', () => {
    const candidates: SnapCandidate[] = [{ x: 0, y: 0, source: 'grid' }];
    const result = magneticSnap({ x: 0, y: 0 }, candidates, -5);
    expect(result.snapped).toBe(false);
    expect(result.source).toBe('none');
  });
});
