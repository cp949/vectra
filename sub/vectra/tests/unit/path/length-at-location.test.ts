/**
 * lengthAtLocation 단위 테스트.
 * { segmentIndex, t } → distance 변환, locationAtLength와의 round-trip,
 * 유효하지 않은 segmentIndex·t·non-finite 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { lengthAtLocation } from '../../../src/path/length-at-location';
import { locationAtLength } from '../../../src/path/location-at-length';
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

describe('lengthAtLocation', () => {
  test('{ segmentIndex: 0, t: 0 } → 0', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: 0 })).toBe(0);
  });

  test('{ segmentIndex: 0, t: 1 } → totalLength', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: 1 })).toBeCloseTo(100, 10);
  });

  test('{ segmentIndex: 0, t: 0.25 } → 25', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: 0.25 })).toBeCloseTo(25, 10);
  });

  test('multi-segment: 두 번째 segment 중간 → cumulative length 합산', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 50 },
    ];
    const len = lengthAtLocation(cmds, { segmentIndex: 1, t: 0.5 });
    expect(len).toBeCloseTo(125, 10);
  });

  test('locationAtLength와 round-trip 일치 (직선)', () => {
    const cmds = makeHorizontalLine();
    const targets = [0, 17, 33, 50, 75, 99];
    for (const d of targets) {
      const loc = locationAtLength(cmds, d);
      expect(loc).toBeDefined();
      const back = lengthAtLocation(cmds, loc as { segmentIndex: number; t: number });
      expect(back).toBeCloseTo(d, 10);
    }
  });

  test('invalid segmentIndex (음수) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: -1, t: 0 })).toBeUndefined();
  });

  test('invalid segmentIndex (segment 수 초과) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 99, t: 0 })).toBeUndefined();
  });

  test('non-integer segmentIndex → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0.5, t: 0 })).toBeUndefined();
  });

  test('non-finite segmentIndex (NaN) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: Number.NaN, t: 0 })).toBeUndefined();
  });

  test('non-finite segmentIndex (Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: Number.POSITIVE_INFINITY, t: 0 })).toBeUndefined();
  });

  test('non-finite segmentIndex (-Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: Number.NEGATIVE_INFINITY, t: 0 })).toBeUndefined();
  });

  test('finite t clamp: t > 1 → segment 끝점 길이', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: 1.5 })).toBeCloseTo(100, 10);
  });

  test('finite t clamp: t < 0 → segment 시작점 길이', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: -0.5 })).toBe(0);
  });

  test('non-finite t (NaN) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: Number.NaN })).toBeUndefined();
  });

  test('non-finite t (Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: Number.POSITIVE_INFINITY })).toBeUndefined();
  });

  test('non-finite t (-Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(lengthAtLocation(cmds, { segmentIndex: 0, t: Number.NEGATIVE_INFINITY })).toBeUndefined();
  });

  test('empty path → undefined', () => {
    expect(lengthAtLocation([], { segmentIndex: 0, t: 0 })).toBeUndefined();
  });

  test('Move-only path → undefined', () => {
    expect(lengthAtLocation([{ kind: 'move', x: 1, y: 2 }], { segmentIndex: 0, t: 0 })).toBeUndefined();
  });

  test('입력 location object를 mutate하지 않는다', () => {
    const cmds = makeHorizontalLine();
    const loc = { segmentIndex: 0, t: 1.5 };
    lengthAtLocation(cmds, loc);
    expect(loc).toEqual({ segmentIndex: 0, t: 1.5 });
  });
});
