/**
 * locationAtLength 단위 테스트.
 * distance → { segmentIndex, t } 변환, multi-segment·multi-subpath, 경계·non-finite 동작을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { length } from '../../../src/path/length';
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

describe('locationAtLength', () => {
  test('distance = 0 → { segmentIndex: 0, t: 0 }', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, 0)).toEqual({ segmentIndex: 0, t: 0 });
  });

  test('distance = totalLength → { segmentIndex: lastIndex, t: 1 }', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, 100)).toEqual({ segmentIndex: 0, t: 1 });
  });

  test('distance = totalLength에서 trailing zero-length segment가 lastIndex이면 t=1을 반환한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(locationAtLength(cmds, length(cmds))).toEqual({ segmentIndex: 1, t: 1 });
  });

  test('정확한 중간 distance → 해당 segment의 t', () => {
    const cmds = makeHorizontalLine();
    const loc = locationAtLength(cmds, 25);
    expect(loc).toEqual({ segmentIndex: 0, t: 0.25 });
  });

  test('multi-segment: 두 번째 line segment 위치', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 100, y: 0 },
      { kind: 'line', x: 100, y: 50 },
    ];
    // segment 0: 길이 100. segment 1: 길이 50. distance 125 = segment 1의 t = 0.5
    const loc = locationAtLength(cmds, 125);
    expect(loc?.segmentIndex).toBe(1);
    expect(loc?.t).toBeCloseTo(0.5, 10);
  });

  test('multi-subpath: MoveCommand는 segmentIndex 카운트에서 제외', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 100, y: 0 },
      { kind: 'line', x: 110, y: 0 },
    ];
    // subpath1 line: idx 0 (길이 10). subpath2 line: idx 1 (길이 10).
    const loc = locationAtLength(cmds, 15);
    expect(loc?.segmentIndex).toBe(1);
    expect(loc?.t).toBeCloseTo(0.5, 10);
  });

  test('empty path → undefined', () => {
    expect(locationAtLength([], 0)).toBeUndefined();
  });

  test('Move-only path → undefined', () => {
    expect(locationAtLength([{ kind: 'move', x: 1, y: 2 }], 0)).toBeUndefined();
  });

  test('distance < 0 → { segmentIndex: 0, t: 0 }', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, -10)).toEqual({ segmentIndex: 0, t: 0 });
  });

  test('distance > totalLength → { segmentIndex: lastIndex, t: 1 }', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, 9999)).toEqual({ segmentIndex: 0, t: 1 });
  });

  test('non-finite distance (NaN) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, Number.NaN)).toBeUndefined();
  });

  test('non-finite distance (Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  test('non-finite distance (-Infinity) → undefined', () => {
    const cmds = makeHorizontalLine();
    expect(locationAtLength(cmds, Number.NEGATIVE_INFINITY)).toBeUndefined();
  });
});
