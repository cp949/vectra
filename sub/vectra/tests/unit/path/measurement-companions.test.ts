/**
 * S2-RM-003 companion gap 보완 함수와 propertiesAtLength 단위 테스트.
 * bounds / closestPoint / pointAtLength companion은 대응 *-into 함수와 결과를 대조한다.
 * propertiesAtLength는 위치·접선·segmentIndex·경계 정책을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { bounds } from '../../../src/path/bounds';
import { boundsInto } from '../../../src/path/bounds-into';
import { closestPoint } from '../../../src/path/closest-point';
import { closestPointInto } from '../../../src/path/closest-point-into';
import { pointAtLength } from '../../../src/path/point-at-length';
import { pointAtLengthInto } from '../../../src/path/point-at-length-into';
import { propertiesAtLength } from '../../../src/path/properties-at-length';
import type { BoundsWritable, PathCommand, XYObjectWritable } from '../../../src/types/index';

describe('bounds (boundsInto companion)', () => {
  test('rect path bounds는 boundsInto 결과와 동일하다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 10, y: 20 },
      { kind: 'line', x: 110, y: 20 },
      { kind: 'line', x: 110, y: 70 },
      { kind: 'line', x: 10, y: 70 },
      { kind: 'close' },
    ];
    const into: BoundsWritable = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    boundsInto(into, cmds);
    const result = bounds(cmds);
    expect(result.min.x).toBe(into.min.x);
    expect(result.min.y).toBe(into.min.y);
    expect(result.max.x).toBe(into.max.x);
    expect(result.max.y).toBe(into.max.y);
    expect(result.min.x).toBe(10);
    expect(result.max.x).toBe(110);
  });

  test('empty path → sentinel bounds 반환', () => {
    const result = bounds([]);
    expect(result.min.x).toBe(Infinity);
    expect(result.min.y).toBe(Infinity);
    expect(result.max.x).toBe(-Infinity);
    expect(result.max.y).toBe(-Infinity);
  });

  test('새 object를 반환한다 (caller 입력과 분리)', () => {
    const a = bounds([{ kind: 'move', x: 1, y: 2 }]);
    const b = bounds([{ kind: 'move', x: 1, y: 2 }]);
    expect(a).not.toBe(b);
    expect(a.min).not.toBe(a.max);
  });
});

describe('closestPoint (closestPointInto companion)', () => {
  const square: PathCommand[] = [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
    { kind: 'line', x: 100, y: 100 },
    { kind: 'line', x: 0, y: 100 },
    { kind: 'close' },
  ];

  test('성공 시 closestPointInto와 동일한 좌표를 새 object로 반환', () => {
    const into: XYObjectWritable = { x: 0, y: 0 };
    const ok = closestPointInto(into, square, [50, -10]);
    expect(ok).toBe(true);
    const result = closestPoint(square, [50, -10]);
    expect(result).toBeDefined();
    expect(result?.x).toBeCloseTo(into.x, 10);
    expect(result?.y).toBeCloseTo(into.y, 10);
    expect(result?.x).toBeCloseTo(50, 10);
    expect(result?.y).toBeCloseTo(0, 10);
  });

  test('empty path → undefined', () => {
    expect(closestPoint([], [0, 0])).toBeUndefined();
  });

  test('move-only path → 첫 Move 위치 반환 (companion object)', () => {
    const result = closestPoint([{ kind: 'move', x: 7, y: 9 }], [100, 100]);
    expect(result).toEqual({ x: 7, y: 9 });
  });
});

describe('pointAtLength (pointAtLengthInto companion)', () => {
  const line: PathCommand[] = [
    { kind: 'move', x: 0, y: 0 },
    { kind: 'line', x: 100, y: 0 },
  ];

  test('성공 시 pointAtLengthInto와 동일한 좌표를 새 object로 반환', () => {
    const into: XYObjectWritable = { x: 0, y: 0 };
    pointAtLengthInto(into, line, 40);
    const result = pointAtLength(line, 40);
    expect(result).toBeDefined();
    expect(result?.x).toBeCloseTo(into.x, 10);
    expect(result?.y).toBeCloseTo(into.y, 10);
    expect(result?.x).toBeCloseTo(40, 10);
  });

  test('empty path → undefined', () => {
    expect(pointAtLength([], 0)).toBeUndefined();
  });

  test('move-only path → undefined', () => {
    expect(pointAtLength([{ kind: 'move', x: 1, y: 2 }], 0)).toBeUndefined();
  });

  test('distance clamp: 음수 → 시작점, 초과 → 끝점', () => {
    expect(pointAtLength(line, -5)).toEqual({ x: 0, y: 0 });
    expect(pointAtLength(line, 9999)).toEqual({ x: 100, y: 0 });
  });
});

describe('propertiesAtLength', () => {
  test('empty path → undefined', () => {
    expect(propertiesAtLength([], 0)).toBeUndefined();
  });

  test('move-only path → undefined', () => {
    expect(propertiesAtLength([{ kind: 'move', x: 3, y: 4 }], 0)).toBeUndefined();
  });

  test('line segment 중간 — 위치/접선/angle/segmentIndex', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
    ];
    const r = propertiesAtLength(cmds, 50);
    expect(r).toBeDefined();
    expect(r?.x).toBeCloseTo(50, 10);
    expect(r?.y).toBeCloseTo(0, 10);
    expect(r?.tangentX).toBeCloseTo(1, 10);
    expect(r?.tangentY).toBeCloseTo(0, 10);
    expect(r?.angle).toBeCloseTo(0, 10);
    expect(r?.segmentIndex).toBe(0);
  });

  test('distance <= 0 → 첫 draw segment 시작점 properties', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 10, y: 10 },
      { kind: 'line', x: 10, y: 110 },
    ];
    const r = propertiesAtLength(cmds, -5);
    expect(r?.x).toBeCloseTo(10, 10);
    expect(r?.y).toBeCloseTo(10, 10);
    // 방향 (0,1) → angle = PI/2
    expect(r?.tangentX).toBeCloseTo(0, 10);
    expect(r?.tangentY).toBeCloseTo(1, 10);
    expect(r?.angle).toBeCloseTo(Math.PI / 2, 10);
    expect(r?.segmentIndex).toBe(0);
  });

  test('distance >= totalLength → 마지막 draw segment 끝점 properties', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 50 },
    ];
    const r = propertiesAtLength(cmds, 99999);
    expect(r?.x).toBeCloseTo(100, 10);
    expect(r?.y).toBeCloseTo(50, 10);
    expect(r?.tangentX).toBeCloseTo(0, 10);
    expect(r?.tangentY).toBeCloseTo(1, 10);
    expect(r?.segmentIndex).toBe(1);
  });

  test('cubic Bezier 접선은 진행 방향과 일치 (수평 직선형 cubic)', () => {
    // 모든 점이 y=0 직선 위 → 접선은 +x 방향
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 25, y1: 0, x2: 75, y2: 0, x: 100, y: 0 },
    ];
    const r = propertiesAtLength(cmds, 50);
    expect(r).toBeDefined();
    expect(r?.y).toBeCloseTo(0, 6);
    expect(r?.tangentX).toBeCloseTo(1, 6);
    expect(r?.tangentY).toBeCloseTo(0, 6);
    expect(r?.segmentIndex).toBe(0);
  });

  test('단위 접선 벡터: hypot(tangentX, tangentY) ≈ 1', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 30, y: 40 },
    ];
    const r = propertiesAtLength(cmds, 25);
    const mag = Math.hypot(r?.tangentX ?? 0, r?.tangentY ?? 0);
    expect(mag).toBeCloseTo(1, 10);
    expect(r?.tangentX).toBeCloseTo(0.6, 10);
    expect(r?.tangentY).toBeCloseTo(0.8, 10);
  });

  test('multi-subpath: 두 번째 subpath segment의 segmentIndex가 증가한다', () => {
    // subpath1: line (idx 0). subpath2: move(미카운트) + line (idx 1) + line (idx 2)
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 100, y: 0 },
      { kind: 'line', x: 110, y: 0 },
      { kind: 'line', x: 120, y: 0 },
    ];
    // subpath1 길이 10, subpath2 길이 20, total 30.
    const first = propertiesAtLength(cmds, 5);
    expect(first?.segmentIndex).toBe(0);
    const second = propertiesAtLength(cmds, 15); // subpath2 첫 line 위
    expect(second?.segmentIndex).toBe(1);
    expect(second?.x).toBeCloseTo(105, 6);
    const third = propertiesAtLength(cmds, 25); // subpath2 둘째 line 위
    expect(third?.segmentIndex).toBe(2);
    expect(third?.x).toBeCloseTo(115, 6);
  });

  test('close segment 접선은 subpath start 방향', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 100 },
      { kind: 'close' },
    ];
    // total = 100 + 100 + close(약 141.42). close segment는 (100,100)→(0,0) 방향.
    const total = 100 + 100 + Math.hypot(100, 100);
    const r = propertiesAtLength(cmds, total - Math.hypot(100, 100) / 2);
    expect(r?.segmentIndex).toBe(2);
    const expectedMag = Math.hypot(-100, -100);
    expect(r?.tangentX).toBeCloseTo(-100 / expectedMag, 6);
    expect(r?.tangentY).toBeCloseTo(-100 / expectedMag, 6);
  });
});
