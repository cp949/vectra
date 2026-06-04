import { describe, expect, test } from 'vitest';
import { length } from '../../../src/path/length';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// length
// ──────────────────────────────────────────────

describe('length', () => {
  test('empty path → 0', () => {
    expect(length([])).toBe(0);
  });

  test('move-only path → 0', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
    expect(length(cmds)).toBe(0);
  });

  test('단순 line path 길이 — (0,0)→(100,0) = 100', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    expect(length(cmds)).toBe(100);
  });

  test('여러 line segment 합산', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 3, y: 0 },
      { kind: 'line', x: 3, y: 4 },
    ];
    // 3 + 4 = 7
    expect(length(cmds)).toBe(7);
  });

  test('close command를 포함한 삼각형 둘레 — 3-4-5 직각삼각형', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 3, y: 0 },
      { kind: 'line', x: 3, y: 4 },
      { kind: 'close' },
    ];
    // 3 + 4 + 5 = 12
    expect(length(cmds)).toBeCloseTo(12, 10);
  });

  test('다중 subpath — MoveCommand는 arc-length에 미기여, subpath 간 gap은 포함되지 않는다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      // 이동 구간 (같은 y=0, gap = 90) — arc-length에 미기여
      { kind: 'move', x: 100, y: 0 },
      { kind: 'line', x: 110, y: 0 },
    ];
    // 첫 subpath: 0→10 = 10
    // 두 번째 subpath: 100→110 = 10
    // MoveCommand 자체는 arc-length에 기여하지 않으므로 gap 90은 포함 안 됨
    // 총 length = 10 + 10 = 20
    expect(length(cmds)).toBeCloseTo(20, 10);
  });

  test('quadratic path length > 0', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    expect(length(cmds)).toBeGreaterThan(0);
  });

  test('cubic path length > 0', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
    ];
    expect(length(cmds)).toBeGreaterThan(0);
  });

  test('arc path length > 0', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 50, ry: 50, xRotation: 0, largeArc: false, sweep: true, x: 100, y: 0 },
    ];
    expect(length(cmds)).toBeGreaterThan(0);
  });

  test('flatness가 작을수록 curved path length가 같거나 증가한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const lenDefault = length(cmds); // flatness = 0.5
    const lenFine = length(cmds, { flatness: 0.01 });
    // 정밀도가 높을수록 같거나 더 길어진다
    expect(lenFine).toBeGreaterThanOrEqual(lenDefault - 1e-9);
  });
});
