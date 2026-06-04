import { describe, expect, test } from 'vitest';
import { closestPointInto } from '../../../src/path/closest-point-into';
import { distanceToPoint } from '../../../src/path/distance-to-point';
import type { PathCommand, XYObjectWritable } from '../../../src/types/index';

// ──────────────────────────────────────────────
// distanceToPoint
// ──────────────────────────────────────────────

describe('distanceToPoint', () => {
  test('line path에서 exact distance', () => {
    // (0,0)→(100,0) segment에서 point (40, 30)의 거리는 30
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    expect(distanceToPoint(cmds, { x: 40, y: 30 })).toBeCloseTo(30, 10);
  });

  test('point가 segment 위에 있을 때 거리 = 0', () => {
    // (0,0)→(100,0) 위에 있는 (50,0)
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    expect(distanceToPoint(cmds, { x: 50, y: 0 })).toBeCloseTo(0, 10);
  });

  test('close segment 포함 path에서 correct distance', () => {
    // 삼각형 (0,0)→(10,0)→(10,10)→close
    // point (0, 0): 정확히 시작점 → 거리 = 0
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
    ];
    expect(distanceToPoint(cmds, { x: 0, y: 0 })).toBeCloseTo(0, 10);
  });

  test('quadratic path에서 flatten 근사 distance > 0', () => {
    // curve에서 많이 떨어진 점
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    // point (-100, 0): curve로부터 멀리 떨어져 있으므로 distance > 0
    expect(distanceToPoint(cmds, { x: -100, y: 0 })).toBeGreaterThan(0);
  });

  test('empty path → Infinity', () => {
    expect(distanceToPoint([], { x: 0, y: 0 })).toBe(Infinity);
  });

  test('invalid numeric path → throw 없이 NaN distance 전파', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: Number.NaN, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(Number.isNaN(distanceToPoint(cmds, { x: 0, y: 0 }))).toBe(true);
  });

  test('move-only path → 첫 번째 move 위치까지의 거리', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 10, y: 20 }];
    expect(distanceToPoint(cmds, { x: 0, y: 0 })).toBeCloseTo(Math.hypot(10, 20), 10);
  });

  test('draw segment가 없는 non-move path → implicit origin까지의 거리', () => {
    const cmds: PathCommand[] = [{ kind: 'close' }];
    expect(distanceToPoint(cmds, { x: 3, y: 4 })).toBeCloseTo(5, 10);
  });

  test('closestPointInto 결과와 distance 일관성', () => {
    // closestPointInto가 기록한 점과 point 사이의 거리가 distanceToPoint와 같아야 한다
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 100 },
    ];
    const queryPt = { x: 40, y: 30 };
    const out: XYObjectWritable = { x: 0, y: 0 };
    closestPointInto(out, cmds, queryPt);
    const dist = distanceToPoint(cmds, queryPt);
    const expectedDist = Math.hypot(out.x - queryPt.x, out.y - queryPt.y);
    expect(dist).toBeCloseTo(expectedDist, 10);
  });
});
