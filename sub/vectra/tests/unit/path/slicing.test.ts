/**
 * S3-RM-046 TASK-03/04 path slicing 단위 테스트.
 *
 * splitAtLengthInto / splitAtLength: arc-length 기준 path 분할.
 * partialInto / partial: normalized [0,1] ratio 기반 partial.
 */
import { describe, expect, test } from 'vitest';
import { length } from '../../../src/path/length';
import { partial } from '../../../src/path/partial';
import { partialInto } from '../../../src/path/partial-into';
import { splitAtLength } from '../../../src/path/split-at-length';
import { splitAtLengthInto } from '../../../src/path/split-at-length-into';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// 헬퍼: 표준 path 생성기
// ──────────────────────────────────────────────

/** (0,0)→(100,0) 수평 line. 총 길이 100. */
function horizontalLine(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
  ];
}

/** (0,0)→(10,0)→(10,10)→(0,10) close. 둘레 40. */
function unitSquare(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 10, y: 0 },
    { kind: 'line', x: 10, y: 10 },
    { kind: 'line', x: 0, y: 10 },
    { kind: 'close' },
  ];
}

/** 두 개의 단일 line subpath. 각 길이 10, totalLength 20. */
function twoLineSubpaths(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 10, y: 0 },
    { kind: 'move', x: 100, y: 100 },
    { kind: 'line', x: 110, y: 100 },
  ];
}

// ──────────────────────────────────────────────
// splitAtLengthInto / splitAtLength
// ──────────────────────────────────────────────

describe('splitAtLengthInto', () => {
  test('line 중간 split', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 50);
    expect(outA).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 50, y: 0 },
    ]);
    expect(outB).toEqual([
      { kind: 'move', x: 50, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ]);
  });

  test('distance <= 0 → outA empty, outB는 전체 복사', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [{ kind: 'close' }];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 0);
    expect(outA).toEqual([]);
    expect(outB).toEqual(cmds);
  });

  test('distance < 0 → outA empty, outB 전체', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, -100);
    expect(outA).toEqual([]);
    expect(outB).toEqual(cmds);
  });

  test('distance === totalLength → outA 전체, outB empty', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 100);
    expect(outA).toEqual(cmds);
    expect(outB).toEqual([]);
  });

  test('distance > totalLength → outA 전체, outB empty', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 1000);
    expect(outA).toEqual(cmds);
    expect(outB).toEqual([]);
  });

  test('empty path → 양쪽 empty', () => {
    const outA: PathCommand[] = [{ kind: 'close' }];
    const outB: PathCommand[] = [{ kind: 'close' }];
    splitAtLengthInto(outA, outB, [], 5);
    expect(outA).toEqual([]);
    expect(outB).toEqual([]);
  });

  test('move-only path → outA empty, outB는 입력 복사', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }];
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 50);
    expect(outA).toEqual([]);
    expect(outB).toEqual(cmds);
  });

  test('subpath gap은 arc-length에 포함되지 않는다', () => {
    const cmds = twoLineSubpaths();
    // totalLength = 20 (gap 무시). distance = 15 → 첫 subpath 완전 포함 + 둘째 subpath 절반.
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 15);
    expect(outA).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 100, y: 100 },
      { kind: 'line', x: 105, y: 100 },
    ]);
    expect(outB).toEqual([
      { kind: 'move', x: 105, y: 100 },
      { kind: 'line', x: 110, y: 100 },
    ]);
  });

  test('square close segment 안에서 split', () => {
    const cmds = unitSquare();
    // 둘레 40. distance=35 → 마지막 close segment (L(0,10) → (0,0), 길이 10) 안에서 split.
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 35);
    expect(outA).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'line', x: 0, y: 10 },
      { kind: 'line', x: 0, y: 5 },
    ]);
    expect(outB).toEqual([{ kind: 'move', x: 0, y: 5 }, { kind: 'line', x: 0, y: 0 }, { kind: 'close' }]);
  });

  test('quadratic split: 두 sub-curve의 합산 길이가 원본과 일치', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    // tighter flatness로 polyline 길이 안정화
    const fine = { flatness: 1e-4, maxRecursion: 32 };
    const total = length(cmds, fine);
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, total / 2, fine);

    const lenA = length(outA, fine);
    const lenB = length(outB, fine);
    expect(lenA + lenB).toBeCloseTo(total, 3);
    // 첫 sub-curve가 절반 길이에 가까운지
    expect(lenA).toBeCloseTo(total / 2, 2);
    // 양쪽 모두 quadratic으로 시작
    expect(outA[1].kind).toBe('quadratic');
    expect(outB[1].kind).toBe('quadratic');
  });

  test('cubic split: 두 sub-curve의 합산 길이가 원본과 일치', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    const fine = { flatness: 1e-4, maxRecursion: 32 };
    const total = length(cmds, fine);
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, total / 2, fine);

    const lenA = length(outA, fine);
    const lenB = length(outB, fine);
    expect(lenA + lenB).toBeCloseTo(total, 3);
    expect(lenA).toBeCloseTo(total / 2, 2);
    expect(outA[1].kind).toBe('cubic');
    expect(outB[1].kind).toBe('cubic');
  });

  test('arc split: 두 sub-arc의 합산 길이가 원본과 일치, endpoint 연속성', () => {
    // 단위 호 (1,0) → (0,1), CCW (sweep=false), 사분원 = π/2
    const cmds: PathCommand[] = [
      { kind: 'move', x: 1, y: 0 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: false, x: 0, y: 1 },
    ];
    const fine = { flatness: 1e-4, maxRecursion: 32 };
    const total = length(cmds, fine);
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, total / 2, fine);

    const lenA = length(outA, fine);
    const lenB = length(outB, fine);
    expect(lenA + lenB).toBeCloseTo(total, 3);
    expect(outA[1].kind).toBe('arc');
    expect(outB[1].kind).toBe('arc');
    // endpoint 연속성
    const aEnd = outA[1] as { x: number; y: number };
    const bStart = outB[0] as { x: number; y: number };
    expect(bStart.x).toBeCloseTo(aEnd.x, 6);
    expect(bStart.y).toBeCloseTo(aEnd.y, 6);
  });

  test('zero-length line: distance 중간 boundary', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 5, y: 5 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 15, y: 5 },
    ];
    const total = length(cmds);
    expect(total).toBeCloseTo(10);
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, 5);
    // outA + outB 길이 합이 total과 같다
    expect(length(outA) + length(outB)).toBeCloseTo(total, 6);
  });

  test('NaN distance → outA에 전체 복사, outB empty', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, Number.NaN);
    expect(outA).toEqual(cmds);
    expect(outB).toEqual([]);
  });

  test('+Infinity distance → outA 전체, outB empty', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, Number.POSITIVE_INFINITY);
    expect(outA).toEqual(cmds);
    expect(outB).toEqual([]);
  });

  test('-Infinity distance → outA empty, outB 전체', () => {
    const cmds = horizontalLine();
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, Number.NEGATIVE_INFINITY);
    expect(outA).toEqual([]);
    expect(outB).toEqual(cmds);
  });

  test('trailing zero-length close + distance === totalLength → outA 전체', () => {
    // M(0,0) L(10,0) L(0,0) close. 마지막 close는 current=(0,0)==subpathStart라 zero-length.
    // line 길이 10+10=20, close 길이 0. totalLength=20. distance=20은 strict `<` 경계에 의해
    // 어느 segment에도 귀속되지 않아 outA에 전체 path가 복사돼야 한다.
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ];
    const total = length(cmds);
    expect(total).toBeCloseTo(20);
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    splitAtLengthInto(outA, outB, cmds, total);
    expect(outA).toEqual(cmds);
    expect(outB).toEqual([]);
  });

  test('multi-subpath close split: 이후 subpath가 outB에 그대로 append된다', () => {
    // 첫 subpath: M(0,0) L(10,0) Z (둘레 20). 둘째 subpath: M(20,20) L(30,20) Z (둘레 20).
    // 첫 subpath close 안에서 split하면 둘째 subpath는 outB에 통째로 들어가야 한다.
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'close' },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 30, y: 20 },
      { kind: 'close' },
    ];
    const outA: PathCommand[] = [];
    const outB: PathCommand[] = [];
    // 첫 subpath 길이 20 중 15 → close segment (10..20) 중간(t=0.5) → split point (5, 0)
    splitAtLengthInto(outA, outB, cmds, 15);
    expect(outA).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 5, y: 0 },
    ]);
    expect(outB).toEqual([
      { kind: 'move', x: 5, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 30, y: 20 },
      { kind: 'close' },
    ]);
  });

  test('aliasing: outA === commands 안전 처리', () => {
    const arr: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const outB: PathCommand[] = [];
    splitAtLengthInto(arr, outB, arr, 50);
    expect(arr).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 50, y: 0 },
    ]);
    expect(outB).toEqual([
      { kind: 'move', x: 50, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ]);
  });
});

describe('splitAtLength companion', () => {
  test('새 result object와 새 배열을 반환한다', () => {
    const cmds = horizontalLine();
    const r = splitAtLength(cmds, 50);
    expect(r.first).not.toBe(cmds);
    expect(r.second).not.toBe(cmds);
    expect(r.first).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 50, y: 0 },
    ]);
    expect(r.second).toEqual([
      { kind: 'move', x: 50, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ]);
  });

  test('distance <= 0 → first empty, second 전체', () => {
    const cmds = horizontalLine();
    const r = splitAtLength(cmds, 0);
    expect(r.first).toEqual([]);
    expect(r.second).toEqual(cmds);
  });

  test('empty path → 양쪽 empty', () => {
    const r = splitAtLength([], 5);
    expect(r.first).toEqual([]);
    expect(r.second).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// partialInto / partial
// ──────────────────────────────────────────────

describe('partialInto', () => {
  test('start=0, end=1 → 전체 복사', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [];
    partialInto(out, cmds, 0, 1);
    expect(out).toEqual(cmds);
  });

  test('start=0.25, end=0.75 → 중간 절반', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [];
    partialInto(out, cmds, 0.25, 0.75);
    expect(out).toEqual([
      { kind: 'move', x: 25, y: 0 },
      { kind: 'line', x: 75, y: 0 },
    ]);
  });

  test('start < 0, end > 1 clamp', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [];
    partialInto(out, cmds, -0.5, 1.5);
    expect(out).toEqual(cmds);
  });

  test('start > end → empty', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [{ kind: 'close' }];
    partialInto(out, cmds, 0.7, 0.3);
    expect(out).toEqual([]);
  });

  test('start === end → empty (zero-length partial)', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [];
    partialInto(out, cmds, 0.5, 0.5);
    expect(out).toEqual([]);
  });

  test('empty path → empty', () => {
    const out: PathCommand[] = [];
    partialInto(out, [], 0, 1);
    expect(out).toEqual([]);
  });

  test('move-only path → empty (length 0)', () => {
    const out: PathCommand[] = [];
    partialInto(out, [{ kind: 'move', x: 5, y: 5 }], 0, 1);
    expect(out).toEqual([]);
  });

  test('cubic partial: 길이가 원본 절반과 일치', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    const fine = { flatness: 1e-4, maxRecursion: 32 };
    const total = length(cmds, fine);
    const out: PathCommand[] = [];
    partialInto(out, cmds, 0.25, 0.75, fine);
    expect(length(out, fine)).toBeCloseTo(total / 2, 2);
  });

  test('aliasing: out === commands 안전', () => {
    const arr: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    partialInto(arr, arr, 0.25, 0.75);
    expect(arr).toEqual([
      { kind: 'move', x: 25, y: 0 },
      { kind: 'line', x: 75, y: 0 },
    ]);
  });

  test('returns out reference', () => {
    const cmds = horizontalLine();
    const out: PathCommand[] = [];
    const result = partialInto(out, cmds, 0.25, 0.75);
    expect(result).toBe(out);
  });
});

describe('partial companion', () => {
  test('새 PathCommand 배열을 반환한다', () => {
    const cmds = horizontalLine();
    const result = partial(cmds, 0.25, 0.75);
    expect(result).not.toBe(cmds);
    expect(result).toEqual([
      { kind: 'move', x: 25, y: 0 },
      { kind: 'line', x: 75, y: 0 },
    ]);
  });

  test('empty path → 새 빈 배열', () => {
    const cmds: PathCommand[] = [];
    const result = partial(cmds, 0, 1);
    expect(result).not.toBe(cmds);
    expect(result).toEqual([]);
  });
});
