import { describe, expect, test } from 'vitest';
import { createRng } from '../../../src/random/create-rng';
import { pointOnPathInto } from '../../../src/random/point-on-path-into';

describe('pointOnPathInto', () => {
  test('정상 path(move+line sequence): rng=0.5 → 중간점 기록, true 반환', () => {
    // commands: move(0,0) line(8,0), totalLength=8, distance=0.5*8=4 → (4,0)
    const out = { x: 0, y: 0 };
    const result = pointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 8, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(4);
    expect(out.y).toBeCloseTo(0);
  });

  test('multi-segment path: 결과 점이 올바른 segment에 속하는지 검증', () => {
    // commands: move(0,0) line(4,0) move(4,0) line(4,4) — 두 subpath, 각 length=4, total=8
    // rng=0.25 → distance=2 → 첫 segment의 (2,0)에 속함
    const out = { x: 0, y: 0 };
    const commands = [
      { kind: 'move' as const, x: 0, y: 0 },
      { kind: 'line' as const, x: 4, y: 0 },
      { kind: 'move' as const, x: 4, y: 0 },
      { kind: 'line' as const, x: 4, y: 4 },
    ];
    const result = pointOnPathInto(out, commands, () => 0.25);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(0);
  });

  test('multi-subpath path: 총 length 기준 각 subpath에 비례 sample', () => {
    // subpath1: move(0,0)line(1,0) (length=1), subpath2: move(10,0)line(11,0) (length=1), total=2
    const commands = [
      { kind: 'move' as const, x: 0, y: 0 },
      { kind: 'line' as const, x: 1, y: 0 },
      { kind: 'move' as const, x: 10, y: 0 },
      { kind: 'line' as const, x: 11, y: 0 },
    ];
    // rng=0.25 → distance=0.5 → subpath1 위 (0.5,0)
    const out1 = { x: 0, y: 0 };
    const r1 = pointOnPathInto(out1, commands, () => 0.25);
    expect(r1).toBe(true);
    expect(out1.x).toBeCloseTo(0.5);
    expect(out1.y).toBeCloseTo(0);

    // rng=0.75 → distance=1.5 → subpath2 위 (10.5,0)
    const out2 = { x: 0, y: 0 };
    const r2 = pointOnPathInto(out2, commands, () => 0.75);
    expect(r2).toBe(true);
    expect(out2.x).toBeCloseTo(10.5);
    expect(out2.y).toBeCloseTo(0);
  });

  test('empty commands → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = pointOnPathInto(out, [], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('move-only path(drawing segment 없음) → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = pointOnPathInto(out, [{ kind: 'move', x: 0, y: 0 }], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('totalLength===0(동일 좌표 line segment) → false, out 미수정', () => {
    // commands: move(3,3) line(3,3), length=0
    const out = { x: 7, y: 8 };
    const result = pointOnPathInto(
      out,
      [
        { kind: 'move', x: 3, y: 3 },
        { kind: 'line', x: 3, y: 3 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('NaN coord in commands → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: NaN, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('Infinity coord in commands → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: Infinity, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('-Infinity coord in commands → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = pointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: -Infinity, y: 0 },
      ],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('seed 기반 deterministic: 같은 seed → 같은 결과, RNG 소비 1회', () => {
    const commands = [
      { kind: 'move' as const, x: 0, y: 0 },
      { kind: 'line' as const, x: 10, y: 0 },
    ];
    const rng1 = createRng('S3-RM-029-pointOnPathInto-determinism');
    const rng2 = createRng('S3-RM-029-pointOnPathInto-determinism');
    const out1 = { x: 0, y: 0 };
    const out2 = { x: 0, y: 0 };
    pointOnPathInto(out1, commands, rng1);
    pointOnPathInto(out2, commands, rng2);
    expect(out1.x).toBe(out2.x);
    expect(out1.y).toBe(out2.y);

    // RNG 소비 1회 검증
    let calls = 0;
    const countingRng = () => {
      calls++;
      return 0.3;
    };
    const out3 = { x: 0, y: 0 };
    pointOnPathInto(out3, commands, countingRng);
    expect(calls).toBe(1);
  });

  test('length-uniform 통계: 긴 segment에 ~75% sample, tolerance 3%', () => {
    // path: move(0,0) line(1,0) move(1,0) line(4,0), segment0 len=1, segment1 len=3, total=4
    // ~75%가 out.x > 1 (긴 segment 구간)에 속해야 한다
    const commands = [
      { kind: 'move' as const, x: 0, y: 0 },
      { kind: 'line' as const, x: 1, y: 0 },
      { kind: 'move' as const, x: 1, y: 0 },
      { kind: 'line' as const, x: 4, y: 0 },
    ];
    const rng = createRng('S3-RM-029-pointOnPathInto');
    const N = 10000;
    let longSegCount = 0;
    const out = { x: 0, y: 0 };
    for (let i = 0; i < N; i++) {
      pointOnPathInto(out, commands, rng);
      if (out.x > 1) longSegCount++;
    }
    expect(Math.abs(longSegCount / N - 0.75)).toBeLessThan(0.03);
  });
});
