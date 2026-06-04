/**
 * path containment 테스트
 *
 * containsPoint: even-odd rule 기반 point-in-path 판정.
 * winding: 부호 있는 winding number 반환.
 */

import { describe, expect, test } from 'vitest';
import { containsPoint } from '../../../src/path/contains-point';
import { winding } from '../../../src/path/winding';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// 공통 fixture
// ──────────────────────────────────────────────

/**
 * 정삼각형 path (clockwise, CloseCommand 포함).
 * 꼭짓점: (0,0), (100,0), (50,100)
 */
function makeTriangle(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
    { kind: 'line', x: 50, y: 100 },
    { kind: 'close' },
  ];
}

/**
 * 외부 사각형 subpath (clockwise, 0~200 범위).
 */
function makeOuterRect(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 200, y: 0 },
    { kind: 'line', x: 200, y: 200 },
    { kind: 'line', x: 0, y: 200 },
    { kind: 'close' },
  ];
}

/**
 * 내부 사각형 subpath (clockwise, 50~150 범위).
 */
function makeInnerRect(): PathCommand[] {
  return [
    { kind: 'move', x: 50, y: 50 },
    { kind: 'line', x: 150, y: 50 },
    { kind: 'line', x: 150, y: 150 },
    { kind: 'line', x: 50, y: 150 },
    { kind: 'close' },
  ];
}

/**
 * 두 사각형이 결합된 multi-subpath (outer + inner 중첩).
 * even-odd rule에서 inner 영역은 홀수 crossing이 아니라 짝수 → false.
 */
function makeDonutPath(): PathCommand[] {
  return [...makeOuterRect(), ...makeInnerRect()];
}

// ──────────────────────────────────────────────
// containsPoint
// ──────────────────────────────────────────────

describe('containsPoint', () => {
  // -- empty path

  test('empty path → false', () => {
    expect(containsPoint([], { x: 0, y: 0 })).toBe(false);
  });

  // -- closed triangle

  test('삼각형 내부 → true', () => {
    expect(containsPoint(makeTriangle(), { x: 50, y: 30 })).toBe(true);
  });

  test('삼각형 외부 → false', () => {
    expect(containsPoint(makeTriangle(), { x: 200, y: 200 })).toBe(false);
  });

  test('삼각형 꼭짓점 (boundary) → true', () => {
    // (0,0) 꼭짓점 — boundary touch
    expect(containsPoint(makeTriangle(), { x: 0, y: 0 })).toBe(true);
  });

  test('삼각형 변 위의 점 (boundary) → true', () => {
    // (50,0) — 밑변 위
    expect(containsPoint(makeTriangle(), { x: 50, y: 0 })).toBe(true);
  });

  // -- open path (CloseCommand 없음)

  test('open path — CloseCommand 없으면 면적 없음 → false', () => {
    const open: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 50, y: 100 },
    ];
    expect(containsPoint(open, { x: 50, y: 30 })).toBe(false);
  });

  // -- multi-subpath (even-odd rule)

  test('donut even-odd — outer 영역 내부이지만 inner 기준 외부 → true', () => {
    // outer 범위 내이고 inner 범위 외 → crossing 홀수 → true
    expect(containsPoint(makeDonutPath(), { x: 10, y: 10 })).toBe(true);
  });

  test('donut even-odd — inner 영역 내부 → false', () => {
    // inner까지 2번 crossing → 짝수 → false
    expect(containsPoint(makeDonutPath(), { x: 100, y: 100 })).toBe(false);
  });

  test('donut even-odd — outer 범위 외부 → false', () => {
    expect(containsPoint(makeDonutPath(), { x: 300, y: 300 })).toBe(false);
  });

  // -- move-only path

  test('move-only path → false', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 50, y: 50 }];
    expect(containsPoint(cmds, { x: 50, y: 50 })).toBe(false);
  });

  // -- degenerate path (zero-area closed path)

  test('선을 왕복하는 closed path (zero area) → false', () => {
    // (0,0)→(100,0)→(0,0)→close: 면적이 없는 degenerate closed path
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ];
    expect(containsPoint(cmds, { x: 50, y: 10 })).toBe(false);
  });

  // -- tuple input

  test('tuple point input → 동일하게 작동', () => {
    expect(containsPoint(makeTriangle(), [50, 30])).toBe(true);
    expect(containsPoint(makeTriangle(), [200, 200])).toBe(false);
  });

  // -- options 전달

  test('flatness option 전달 — 결과가 유효한 boolean', () => {
    const result = containsPoint(makeTriangle(), { x: 50, y: 30 }, { flatness: 0.1 });
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });
});

// ──────────────────────────────────────────────
// winding
// ──────────────────────────────────────────────

describe('winding', () => {
  // -- empty path

  test('empty path → 0', () => {
    expect(winding([], { x: 0, y: 0 })).toBe(0);
  });

  // -- closed triangle (clockwise: (0,0)→(100,0)→(50,100)→close)

  test('clockwise 삼각형 내부 → winding !== 0', () => {
    const w = winding(makeTriangle(), { x: 50, y: 30 });
    expect(w).not.toBe(0);
  });

  test('삼각형 외부 → winding === 0', () => {
    expect(winding(makeTriangle(), { x: 200, y: 200 })).toBe(0);
  });

  // -- nonzero 규칙 검증 (winding 부호)

  test('삼각형 (0,0)→(100,0)→(50,100) 내부 → winding +1 (화면 좌표계 CW → +1)', () => {
    // (0,0)→(100,0)→(50,100): y-down 화면 좌표계에서 clockwise → winding = +1
    const w = winding(makeTriangle(), { x: 50, y: 30 });
    expect(w).toBeGreaterThan(0);
  });

  // -- open path

  test('open path → winding 0 (면적 없음)', () => {
    const open: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 50, y: 100 },
    ];
    expect(winding(open, { x: 50, y: 30 })).toBe(0);
  });

  // -- move-only

  test('move-only path → 0', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 50, y: 50 }];
    expect(winding(cmds, { x: 50, y: 50 })).toBe(0);
  });

  // -- tuple input

  test('tuple point input → 동일하게 작동', () => {
    expect(winding(makeTriangle(), [200, 200])).toBe(0);
    expect(winding(makeTriangle(), [50, 30])).not.toBe(0);
  });

  // -- multi-subpath 누적

  test('donut outer 영역 — outer만 1회 crossing → winding !== 0', () => {
    // (10,10): outer 내부, inner 외부 → outer 기여 1
    const w = winding(makeDonutPath(), { x: 10, y: 10 });
    expect(w).not.toBe(0);
  });

  test('donut inner 영역 — outer+inner 각 1회 crossing → winding 합산', () => {
    // (100,100): outer 내부이면서 inner 내부 → 두 subpath 모두 기여
    const w = winding(makeDonutPath(), { x: 100, y: 100 });
    // 두 CW subpath이므로 +1 + +1 = 2
    expect(w).toBe(2);
  });

  // -- options 전달

  test('flatness option 전달 — 결과가 유효한 number', () => {
    const result = winding(makeTriangle(), { x: 50, y: 30 }, { flatness: 0.1 });
    expect(typeof result).toBe('number');
  });
});
