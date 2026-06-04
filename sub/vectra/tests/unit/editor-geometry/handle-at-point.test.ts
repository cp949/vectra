/**
 * editor-geometry handle-at-point 단위 테스트
 *
 * handleAtPoint hit-test 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { handleAtPoint } from '../../../src/editor-geometry/handle-at-point';
import type { HandlePoint } from '../../../src/editor-geometry/types';

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/**
 * 단순 좌표 HandlePoint를 생성하는 헬퍼.
 *
 * @param id handle 식별자
 * @param x handle x 좌표
 * @param y handle y 좌표
 */
function hp(
  id: HandlePoint<{ x: number; y: number }>['id'],
  x: number,
  y: number
): HandlePoint<{ x: number; y: number }> {
  return { id, point: { x, y } };
}

describe('editor-geometry - handleAtPoint', () => {
  // -------------------------------------------------------------------------
  // 정상 hit
  // -------------------------------------------------------------------------

  test('tolerance 이내 handle을 hit한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0), hp('se', 100, 100)];
    const result = handleAtPoint(handles, { x: 2, y: 2 }, 5);
    expect(result).toBe('nw');
  });

  test('가장 가까운 handle을 반환한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0), hp('n', 50, 0)];
    // cursor가 (52, 0) — n handle에서 거리 2, nw handle에서 거리 52
    const result = handleAtPoint(handles, { x: 52, y: 0 }, 10);
    expect(result).toBe('n');
  });

  // -------------------------------------------------------------------------
  // hit 없음
  // -------------------------------------------------------------------------

  test('모든 handle이 tolerance 밖이면 undefined를 반환한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0), hp('se', 100, 100)];
    const result = handleAtPoint(handles, { x: 50, y: 50 }, 5);
    expect(result).toBeUndefined();
  });

  test('empty handles이면 undefined를 반환한다', () => {
    const result = handleAtPoint([], { x: 0, y: 0 }, 10);
    expect(result).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // tolerance 경계
  // -------------------------------------------------------------------------

  test('정확히 tolerance 거리에 있는 handle은 hit한다 (경계 포함)', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('e', 10, 0)];
    // cursor (0, 0)에서 e handle까지 거리 = 10, tolerance = 10 → hit
    const result = handleAtPoint(handles, { x: 0, y: 0 }, 10);
    expect(result).toBe('e');
  });

  test('tolerance를 초과하는 거리에 있는 handle은 miss한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('e', 10, 0)];
    // cursor (0, 0)에서 e handle까지 거리 = 10, tolerance = 9.9 → miss
    const result = handleAtPoint(handles, { x: 0, y: 0 }, 9.9);
    expect(result).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // 동거리 tie-break
  // -------------------------------------------------------------------------

  test('동거리 두 handle은 insertion order 우선 (배열 앞쪽)을 반환한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', -5, 0), hp('ne', 5, 0)];
    // cursor (0, 0)에서 nw, ne 모두 거리 5
    const result = handleAtPoint(handles, { x: 0, y: 0 }, 10);
    expect(result).toBe('nw');
  });

  // -------------------------------------------------------------------------
  // invalid tolerance
  // -------------------------------------------------------------------------

  test('tolerance = 0이면 모두 miss (undefined)', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0)];
    const result = handleAtPoint(handles, { x: 0, y: 0 }, 0);
    expect(result).toBeUndefined();
  });

  test('tolerance < 0이면 모두 miss (undefined)', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0)];
    const result = handleAtPoint(handles, { x: 0, y: 0 }, -1);
    expect(result).toBeUndefined();
  });

  test('tolerance = NaN이면 모두 miss (undefined)', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0)];
    const result = handleAtPoint(handles, { x: 0, y: 0 }, Number.NaN);
    expect(result).toBeUndefined();
  });

  test('tolerance = Infinity이면 모두 miss (undefined)', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('nw', 0, 0)];
    const result = handleAtPoint(handles, { x: 0, y: 0 }, Infinity);
    expect(result).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // 모든 HandleId 반환 검증
  // -------------------------------------------------------------------------

  test('모든 HandleId 값을 올바르게 반환한다', () => {
    const ids = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'rotate'] as const;
    for (const id of ids) {
      const handles: HandlePoint<{ x: number; y: number }>[] = [hp(id, 0, 0)];
      const result = handleAtPoint(handles, { x: 0, y: 0 }, 1);
      expect(result).toBe(id);
    }
  });

  // -------------------------------------------------------------------------
  // XYInput 다형성 (array tuple 형식)
  // -------------------------------------------------------------------------

  test('cursor가 [number, number] tuple 형식이어도 동작한다', () => {
    const handles: HandlePoint<{ x: number; y: number }>[] = [hp('s', 0, 10)];
    const result = handleAtPoint(handles, [0, 8], 5);
    expect(result).toBe('s');
  });

  test('handles.point가 [number, number] tuple 형식이어도 동작한다', () => {
    const handles: HandlePoint<[number, number]>[] = [{ id: 'sw', point: [0, 10] }];
    const result = handleAtPoint(handles, { x: 0, y: 10 }, 1);
    expect(result).toBe('sw');
  });
});
