/**
 * curvatureAtLength 단위 테스트.
 * 직선·arc·Bezier segment 곡률 값과 부호, degenerate·non-finite 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { curvatureAtLength } from '../../../src/path/curvature-at-length';
import { length } from '../../../src/path/length';
import type { PathCommand } from '../../../src/types/index';

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

/**
 * 단위 원에 가까운 SVG arc path. center (0,0), radius 1, CCW 1바퀴.
 * SVG arc 한 번에는 360°를 그릴 수 없으므로 두 개의 180° arc로 구성한다.
 * sweep=false → counter-clockwise.
 */
function makeUnitCircle(): PathCommand[] {
  return [
    { kind: 'move', x: 1, y: 0 },
    {
      kind: 'arc',
      rx: 1,
      ry: 1,
      xRotation: 0,
      largeArc: false,
      sweep: false,
      x: -1,
      y: 0,
    },
    {
      kind: 'arc',
      rx: 1,
      ry: 1,
      xRotation: 0,
      largeArc: false,
      sweep: false,
      x: 1,
      y: 0,
    },
  ];
}

describe('curvatureAtLength', () => {
  test('직선 segment → 0', () => {
    const cmds = makeHorizontalLine();
    expect(curvatureAtLength(cmds, 50)).toBe(0);
  });

  test('close segment → 0', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 100 },
      { kind: 'close' },
    ];
    // close segment(2)는 (100, 100) → (0, 0)에 해당. close segment 거리 ~141.42.
    const total = 100 + 100 + Math.hypot(100, 100);
    expect(curvatureAtLength(cmds, total - 10)).toBe(0);
  });

  test('단위 원 (radius 1) 위 곡률 magnitude ≈ 1', () => {
    const cmds = makeUnitCircle();
    const total = length(cmds);
    // 1/4 지점 (단위 원 위)의 곡률 magnitude. arc-length parameter linear 가정으로 인한 작은 오차 허용.
    const k = curvatureAtLength(cmds, total / 4);
    expect(Math.abs(k)).toBeCloseTo(1, 1);
  });

  test('단위 원의 곡률 부호: CCW sweep → 양수 (좌회전 = 양수)', () => {
    // makeUnitCircle은 sweep=false (CCW). 좌회전 관례에서 양수여야 한다.
    const cmds = makeUnitCircle();
    const total = length(cmds);
    const k = curvatureAtLength(cmds, total / 4);
    expect(k).toBeGreaterThan(0);
  });

  test('단위 원의 곡률 부호: CW sweep → 음수 (좌회전 = 양수, sweep=true는 부호 반전)', () => {
    // sweep=true (y-down clockwise) 단위 원. 동일 곡률 magnitude, 부호만 반전.
    const cmds: PathCommand[] = [
      { kind: 'move', x: 1, y: 0 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true, x: -1, y: 0 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true, x: 1, y: 0 },
    ];
    const total = length(cmds);
    const k = curvatureAtLength(cmds, total / 4);
    expect(k).toBeLessThan(0);
    expect(Math.abs(k)).toBeCloseTo(1, 1);
  });

  test('quadratic Bezier → 비선형 곡률 (zero가 아님)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const total = length(cmds);
    const k = curvatureAtLength(cmds, total / 2);
    expect(Math.abs(k)).toBeGreaterThan(0);
  });

  test('degenerate quadratic Bezier에서 zero |B′| → NaN', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 0, y1: 0, x: 0, y: 0 },
    ];
    expect(Number.isNaN(curvatureAtLength(cmds, 0))).toBe(true);
  });

  test('작은 비퇴화 quadratic Bezier의 zero가 아닌 |B′|는 NaN으로 취급하지 않는다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 0, y1: 0.0001, x: 0.0001, y: 0 },
    ];
    const k = curvatureAtLength(cmds, length(cmds) / 2);
    expect(Number.isFinite(k)).toBe(true);
    expect(Math.abs(k)).toBeGreaterThan(1000);
  });

  test('cubic Bezier → 비선형 곡률 (수평 일직선형은 0)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 25, y1: 0, x2: 75, y2: 0, x: 100, y: 0 },
    ];
    const k = curvatureAtLength(cmds, 50);
    expect(Math.abs(k)).toBeLessThan(1e-6);
  });

  test('degenerate cubic Bezier에서 zero |B′| → NaN', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 0, x2: 0, y2: 0, x: 0, y: 0 },
    ];
    expect(Number.isNaN(curvatureAtLength(cmds, 0))).toBe(true);
  });

  test('작은 비퇴화 cubic Bezier의 zero가 아닌 |B′|는 NaN으로 취급하지 않는다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 0.0001, x2: 0.0001, y2: 0.0001, x: 0.0001, y: 0 },
    ];
    const k = curvatureAtLength(cmds, length(cmds) / 2);
    expect(Number.isFinite(k)).toBe(true);
    expect(Math.abs(k)).toBeGreaterThan(1000);
  });

  test('empty path → NaN', () => {
    expect(Number.isNaN(curvatureAtLength([], 0))).toBe(true);
  });

  test('Move-only path → NaN', () => {
    expect(Number.isNaN(curvatureAtLength([{ kind: 'move', x: 1, y: 2 }], 0))).toBe(true);
  });

  test('non-finite distance (NaN) → NaN', () => {
    const cmds = makeHorizontalLine();
    expect(Number.isNaN(curvatureAtLength(cmds, Number.NaN))).toBe(true);
  });

  test('non-finite distance (Infinity) → NaN', () => {
    const cmds = makeHorizontalLine();
    expect(Number.isNaN(curvatureAtLength(cmds, Number.POSITIVE_INFINITY))).toBe(true);
  });

  test('non-finite distance (-Infinity) → NaN', () => {
    const cmds = makeHorizontalLine();
    expect(Number.isNaN(curvatureAtLength(cmds, Number.NEGATIVE_INFINITY))).toBe(true);
  });

  test('distance = 0 → 첫 segment 시작점 곡률 (line → 0)', () => {
    const cmds = makeHorizontalLine();
    expect(curvatureAtLength(cmds, 0)).toBe(0);
  });

  test('distance > totalLength → 마지막 segment 끝점 곡률 (line → 0)', () => {
    const cmds = makeHorizontalLine();
    expect(curvatureAtLength(cmds, 9999)).toBe(0);
  });
});
