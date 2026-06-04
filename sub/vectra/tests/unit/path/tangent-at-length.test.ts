/**
 * tangentAtLength / tangentAtLengthInto 단위 테스트.
 * 직선·곡선·arc segment의 단위 접선 벡터, 경계·degenerate·non-finite 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { length } from '../../../src/path/length';
import { pointAtLengthRatio } from '../../../src/path/point-at-length-ratio';
import { tangentAtLength } from '../../../src/path/tangent-at-length';
import { tangentAtLengthInto } from '../../../src/path/tangent-at-length-into';
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

describe('tangentAtLength / Into', () => {
  test('직선 segment 위 임의 거리 → 단위 방향 벡터 (1, 0)', () => {
    const cmds = makeHorizontalLine();
    const t = tangentAtLength(cmds, 50);
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
    expect(Math.hypot(t?.x ?? 0, t?.y ?? 0)).toBeCloseTo(1, 10);
  });

  test('수평 cubic 위 임의 거리 → 단위 방향 (1, 0)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 25, y1: 0, x2: 75, y2: 0, x: 100, y: 0 },
    ];
    const t = tangentAtLength(cmds, 50);
    expect(t?.x).toBeCloseTo(1, 6);
    expect(t?.y).toBeCloseTo(0, 6);
  });

  test('quadratic 위 단위 접선 magnitude ≈ 1', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const total = length(cmds);
    const t = tangentAtLength(cmds, total / 2);
    expect(Math.hypot(t?.x ?? 0, t?.y ?? 0)).toBeCloseTo(1, 6);
  });

  test('arc 위 임의 거리 → 단위 방향 벡터 (magnitude 1)', () => {
    const cmds = makeUnitCircle();
    const total = length(cmds);
    // tangent는 flatten polyline edge 방향이며 단위 길이가 보장된다.
    const t = tangentAtLength(cmds, total / 4);
    expect(Math.hypot(t?.x ?? 0, t?.y ?? 0)).toBeCloseTo(1, 6);
  });

  test('arc 위 접선은 (원에서) 반지름 벡터와 (대략) 수직 (총 길이 1/8 지점)', () => {
    const cmds = makeUnitCircle();
    const total = length(cmds);
    // 점 위치 (x, y)와 그 점에서의 접선 (tx, ty)의 dot product = (x, y)와 (tx, ty)의 직교성
    // 원에서는 |x·tx + y·ty| ≈ 0 이어야 한다.
    const d = total / 8;
    const p = pointAtLengthRatio(cmds, d / total);
    const t = tangentAtLength(cmds, d);
    const dot = (p?.x ?? 0) * (t?.x ?? 0) + (p?.y ?? 0) * (t?.y ?? 0);
    // flatten polyline 근사라 정확히 0은 아니지만 작은 값.
    expect(Math.abs(dot)).toBeLessThan(0.05);
  });

  test('distance = 0 → 첫 segment 시작점 방향', () => {
    const cmds = makeHorizontalLine();
    const t = tangentAtLength(cmds, 0);
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
  });

  test('distance >= totalLength → 마지막 segment 끝점 방향', () => {
    const cmds = makeHorizontalLine();
    const t = tangentAtLength(cmds, 9999);
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
  });

  test('empty path → undefined', () => {
    expect(tangentAtLength([], 0)).toBeUndefined();
  });

  test('Move-only path → undefined', () => {
    expect(tangentAtLength([{ kind: 'move', x: 1, y: 2 }], 0)).toBeUndefined();
  });

  test('zero-length line segment → zero vector 기록 (단위화 실패 fallback)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ];
    const t = tangentAtLength(cmds, 0);
    expect(t).toEqual({ x: 0, y: 0 });
  });

  test('distance = totalLength가 trailing zero-length segment 끝점이면 zero vector를 기록한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const t = tangentAtLength(cmds, length(cmds));
    expect(t).toEqual({ x: 0, y: 0 });
  });

  test('tangentAtLengthInto: 성공 시 true 반환', () => {
    const cmds = makeHorizontalLine();
    const out: XYObjectWritable = { x: -1, y: -1 };
    expect(tangentAtLengthInto(out, cmds, 50)).toBe(true);
    expect(out.x).toBeCloseTo(1, 10);
    expect(out.y).toBeCloseTo(0, 10);
  });

  test('tangentAtLengthInto: empty → false 반환, out 미수정', () => {
    const out: XYObjectWritable = { x: 7, y: 8 };
    expect(tangentAtLengthInto(out, [], 0)).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('tangentAtLengthInto: zero-length line → true 반환 + (0,0) 기록', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ];
    const out: XYObjectWritable = { x: 99, y: 99 };
    expect(tangentAtLengthInto(out, cmds, 0)).toBe(true);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('non-finite distance (NaN) → propertiesAtLength 분기 따름', () => {
    const cmds = makeHorizontalLine();
    // NaN distance → `distance <= cumulative + segLen` NaN 비교가 false라 forEach 끝까지 진행 →
    // propertiesAtLength fallback이 마지막 segment 끝점 sample → tangent 정상 (1, 0).
    const t = tangentAtLength(cmds, Number.NaN);
    expect(t).toBeDefined();
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
  });

  test('non-finite distance (Infinity) → 마지막 segment 끝점', () => {
    const cmds = makeHorizontalLine();
    const t = tangentAtLength(cmds, Number.POSITIVE_INFINITY);
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
  });

  test('non-finite distance (-Infinity) → 첫 segment 시작 방향', () => {
    const cmds = makeHorizontalLine();
    const t = tangentAtLength(cmds, Number.NEGATIVE_INFINITY);
    expect(t?.x).toBeCloseTo(1, 10);
    expect(t?.y).toBeCloseTo(0, 10);
  });
});
