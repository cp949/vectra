import { describe, expect, test } from 'vitest';
import { weightedPointOnPath } from '../../../src/random/weighted-point-on-path';
import { weightedPointOnPathInto } from '../../../src/random/weighted-point-on-path-into';
import type { PathCommand } from '../../../src/types';

describe('weightedPointOnPath (allocating companion)', () => {
  test('정상 path → { x, y } 반환, Into와 동일 결과', () => {
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 2, y: 1 },
    ];
    const result = weightedPointOnPath(commands, [1, 8], () => 0.5);
    expect(result).toBeDefined();
    if (result !== undefined) {
      const out = { x: 0, y: 0 };
      weightedPointOnPathInto(out, commands, [1, 8], () => 0.5);
      expect(result.x).toBeCloseTo(out.x);
      expect(result.y).toBeCloseTo(out.y);
    }
  });

  test('empty path → undefined', () => {
    const result = weightedPointOnPath([], [], () => 0.5);
    expect(result).toBeUndefined();
  });

  test('move-only path → undefined', () => {
    const result = weightedPointOnPath([{ kind: 'move', x: 0, y: 0 }], [], () => 0.5);
    expect(result).toBeUndefined();
  });

  test('all-zero effective weight는 RangeError', () => {
    expect(() =>
      weightedPointOnPath(
        [
          { kind: 'move', x: 0, y: 0 },
          { kind: 'line', x: 10, y: 0 },
        ],
        [0],
        () => 0.5
      )
    ).toThrow(RangeError);
  });

  test('매번 새 object 반환', () => {
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const r1 = weightedPointOnPath(commands, [1], () => 0.5);
    const r2 = weightedPointOnPath(commands, [1], () => 0.5);
    expect(r1).not.toBe(r2);
  });

  test('성공 시 RNG를 정확히 1회 소비한다', () => {
    let calls = 0;
    weightedPointOnPath(
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.3;
      }
    );
    expect(calls).toBe(1);
  });

  test('non-finite command → undefined, RNG 미소비', () => {
    let calls = 0;
    const result = weightedPointOnPath(
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: NaN, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBeUndefined();
    expect(calls).toBe(0);
  });
});
