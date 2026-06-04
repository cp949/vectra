import { describe, expect, test } from 'vitest';
import { pointAtLengthInto } from '../../../src/path/point-at-length-into';
import type { PathCommand, XYObjectWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// pointAtLengthInto
// ──────────────────────────────────────────────

describe('pointAtLengthInto', () => {
  test('empty path → false, out 미수정', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    const result = pointAtLengthInto(out, [], 0);
    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('move-only path → false (flatten 결과 빈 배열)', () => {
    const out: XYObjectWritable = { x: 99, y: 99 };
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 5 }];
    const result = pointAtLengthInto(out, cmds, 0);
    expect(result).toBe(false);
    expect(out.x).toBe(99);
    expect(out.y).toBe(99);
  });

  test('distance <= 0 → path 시작점 기록, true 반환', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 10, y: 20 },
      { kind: 'line', x: 110, y: 20 },
    ];
    const result = pointAtLengthInto(out, cmds, 0);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(10, 10);
    expect(out.y).toBeCloseTo(20, 10);
  });

  test('distance >= totalLength → path 끝점 기록, true 반환', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const result = pointAtLengthInto(out, cmds, 9999);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(100, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('distance 중간 → line path에서 exact 보간점, true 반환', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const result = pointAtLengthInto(out, cmds, 50);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(50, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('음수 distance → 시작점으로 clamp', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 5, y: 10 },
      { kind: 'line', x: 105, y: 10 },
    ];
    const result = pointAtLengthInto(out, cmds, -50);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(5, 10);
    expect(out.y).toBeCloseTo(10, 10);
  });

  test('zero-length path (중복점 line) → 해당 점 기록, true 반환 (NaN 없음)', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 7, y: 3 },
      { kind: 'line', x: 7, y: 3 },
    ];
    const result = pointAtLengthInto(out, cmds, 0);
    expect(result).toBe(true);
    expect(Number.isNaN(out.x)).toBe(false);
    expect(Number.isNaN(out.y)).toBe(false);
    expect(out.x).toBeCloseTo(7, 10);
    expect(out.y).toBeCloseTo(3, 10);
  });

  test('object output ({x, y}) 검증', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    pointAtLengthInto(out, cmds, 40);
    expect(typeof out.x).toBe('number');
    expect(typeof out.y).toBe('number');
    expect(out.x).toBeCloseTo(40, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('tuple output ([x, y]) 검증', () => {
    const out: [number, number] = [0, 0];
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    pointAtLengthInto(out, cmds, 70);
    expect(out[0]).toBeCloseTo(70, 10);
    expect(out[1]).toBeCloseTo(0, 10);
  });
});
