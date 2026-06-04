/**
 * normalAtLength / normalAtLengthInto 단위 테스트.
 * 좌측 90° 회전 법선 방향, tangent와의 직교성, degenerate·non-finite 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { length } from '../../../src/path/length';
import { normalAtLength } from '../../../src/path/normal-at-length';
import { normalAtLengthInto } from '../../../src/path/normal-at-length-into';
import { tangentAtLength } from '../../../src/path/tangent-at-length';
import type { PathCommand, XYObjectWritable } from '../../../src/types/index';

/**
 * (0,0) → (100, 0) 단일 수평 직선 path.
 * 길이 100, 접선 (1, 0), 법선 (0, 1).
 */
function makeHorizontalLine(): PathCommand[] {
  return [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
  ];
}

describe('normalAtLength / Into', () => {
  test('수평 line 위 접선 (1,0) → 법선 (0,1) (좌측 90° 회전)', () => {
    const cmds = makeHorizontalLine();
    const n = normalAtLength(cmds, 50);
    expect(n?.x).toBeCloseTo(0, 10);
    expect(n?.y).toBeCloseTo(1, 10);
  });

  test('수직 line 위 접선 (0,1) → 법선 (-1, 0)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 100 },
    ];
    const n = normalAtLength(cmds, 50);
    expect(n?.x).toBeCloseTo(-1, 10);
    expect(n?.y).toBeCloseTo(0, 10);
  });

  test('tangent와 normal은 직교 (dot ≈ 0)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 30, y: 40 },
    ];
    const t = tangentAtLength(cmds, 25);
    const n = normalAtLength(cmds, 25);
    const dot = (t?.x ?? 0) * (n?.x ?? 0) + (t?.y ?? 0) * (n?.y ?? 0);
    expect(dot).toBeCloseTo(0, 10);
  });

  test('normal은 단위 벡터 (|n| ≈ 1)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 30, y: 40 },
    ];
    const n = normalAtLength(cmds, 25);
    expect(Math.hypot(n?.x ?? 0, n?.y ?? 0)).toBeCloseTo(1, 10);
  });

  test('empty path → undefined', () => {
    expect(normalAtLength([], 0)).toBeUndefined();
  });

  test('Move-only path → undefined', () => {
    expect(normalAtLength([{ kind: 'move', x: 1, y: 2 }], 0)).toBeUndefined();
  });

  test('zero-length line → (0, 0) 기록 (단위화 실패 fallback)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ];
    const n = normalAtLength(cmds, 0);
    // -tangentY = -0 가능성이 있어 strict equal 대신 magnitude 비교.
    expect(Math.abs(n?.x ?? 1)).toBe(0);
    expect(Math.abs(n?.y ?? 1)).toBe(0);
  });

  test('distance = totalLength가 trailing zero-length segment 끝점이면 zero normal을 기록한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const n = normalAtLength(cmds, length(cmds));
    expect(Math.abs(n?.x ?? 1)).toBe(0);
    expect(Math.abs(n?.y ?? 1)).toBe(0);
  });

  test('normalAtLengthInto: 성공 시 true 반환', () => {
    const cmds = makeHorizontalLine();
    const out: XYObjectWritable = { x: -1, y: -1 };
    expect(normalAtLengthInto(out, cmds, 50)).toBe(true);
    expect(out.x).toBeCloseTo(0, 10);
    expect(out.y).toBeCloseTo(1, 10);
  });

  test('normalAtLengthInto: empty → false 반환, out 미수정', () => {
    const out: XYObjectWritable = { x: 7, y: 8 };
    expect(normalAtLengthInto(out, [], 0)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('non-finite distance (Infinity) → 마지막 segment 끝점 normal', () => {
    const cmds = makeHorizontalLine();
    const n = normalAtLength(cmds, Number.POSITIVE_INFINITY);
    expect(n?.x).toBeCloseTo(0, 10);
    expect(n?.y).toBeCloseTo(1, 10);
  });

  test('non-finite distance (-Infinity) → 첫 segment 시작 normal', () => {
    const cmds = makeHorizontalLine();
    const n = normalAtLength(cmds, Number.NEGATIVE_INFINITY);
    expect(n?.x).toBeCloseTo(0, 10);
    expect(n?.y).toBeCloseTo(1, 10);
  });
});
