import { describe, expect, test } from 'vitest';
import { weightedPointOnPathInto } from '../../../src/random/weighted-point-on-path-into';
import type { PathCommand } from '../../../src/types';

describe('weightedPointOnPathInto', () => {
  test('짧은 segment weight가 커서 선택이 뒤집힌다(deterministic)', () => {
    // move(0,0) line(2,0) line(2,1): seg0 len=2, seg1 len=1
    // weights [1, 8] → effective [2, 8], total=10
    // rng=0.5 → threshold=5 → seg1 선택. localFraction=(5-2)/8=0.375 → absolute=2+0.375=2.375
    // → seg1 위 (2, 0.375)
    const out = { x: 0, y: 0 };
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 2, y: 1 },
    ];
    const result = weightedPointOnPathInto(out, commands, [1, 8], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(0.375);
  });

  test('rng=0은 첫 positive effective segment 시작점을 기록한다', () => {
    const out = { x: 9, y: 9 };
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 2, y: 1 },
    ];
    const result = weightedPointOnPathInto(out, commands, [1, 8], () => 0);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(0);
    expect(out.y).toBeCloseTo(0);
  });

  test('rng→1은 마지막 positive effective segment 끝 근처를 기록한다', () => {
    const out = { x: 0, y: 0 };
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'line', x: 2, y: 1 },
    ];
    const result = weightedPointOnPathInto(out, commands, [1, 8], () => 0.999999999999);
    expect(result).toBe(true);
    // 마지막 positive effective는 seg1((2,0)-(2,1)) 끝 근처
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeGreaterThan(0.99);
    expect(out.y).toBeLessThanOrEqual(1);
  });

  test('move command는 weight index를 소비하지 않는다(drawing segment 기준)', () => {
    // 2개 subpath, drawing segment는 line 2개 뿐 → weights 길이 2
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
      { kind: 'move', x: 10, y: 10 },
      { kind: 'line', x: 12, y: 10 },
    ];
    // weights [0,1] → 두 번째 line subpath만 선택
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(out, commands, [0, 1], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(11);
    expect(out.y).toBeCloseTo(10);
    // command 수(4)에 맞춘 weight는 mismatch RangeError
    expect(() => weightedPointOnPathInto({ x: 0, y: 0 }, commands, [1, 1, 1, 1], () => 0.5)).toThrow(RangeError);
  });

  test('subpath boundary threshold는 다음 drawing segment 시작점을 기록한다', () => {
    // strict `<` 정책: threshold가 seg0 effective 끝에 정확히 닿으면 seg1 선택.
    // distance=2를 그대로 pointAtLengthInto에 넘기면 첫 subpath endpoint (2,0)로 마스킹된다.
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 2, y: 0 },
        { kind: 'move', x: 10, y: 0 },
        { kind: 'line', x: 12, y: 0 },
      ],
      [1, 1],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(10);
    expect(out.y).toBeCloseTo(0);
  });

  test('close command는 weighted drawing segment다', () => {
    // move(0,0) line(4,0) line(4,3) close: seg0 len4, seg1 len3, close len5
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 4, y: 0 },
      { kind: 'line', x: 4, y: 3 },
      { kind: 'close' },
    ];
    // weights [0,0,1] → close((4,3)->(0,0))만 선택. rng=0.5 → close 중점 (2, 1.5)
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(out, commands, [0, 0, 1], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(1.5);
  });

  test('curve drawing segment도 weight 단위다(cubic)', () => {
    // move(0,0) line(10,0) cubic → drawing segment 2개. weights 길이 2.
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'cubic', x1: 10, y1: 10, x2: 20, y2: 10, x: 20, y: 0 },
    ];
    // weights [1,0] → line((0,0)-(10,0))만 선택 → y=0
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(out, commands, [1, 0], () => 0.5);
    expect(result).toBe(true);
    expect(out.y).toBeCloseTo(0);
    expect(out.x).toBeGreaterThan(0);
    expect(out.x).toBeLessThan(10);
    // weight 길이 3은 mismatch
    expect(() => weightedPointOnPathInto({ x: 0, y: 0 }, commands, [1, 0, 0], () => 0.5)).toThrow(RangeError);
  });

  test('quadratic drawing segment도 weight 단위다', () => {
    // move(0,0) line(10,0) quadratic → drawing segment 2개. weights 길이 2.
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'quadratic', x1: 15, y1: 10, x: 20, y: 0 },
    ];
    // weights [0,1] → quadratic((10,0)~(20,0), 위로 볼록)만 선택 → 곡선 위 점 y>0
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(out, commands, [0, 1], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeGreaterThan(10);
    expect(out.y).toBeGreaterThan(0);
    // weight 길이 3은 mismatch
    expect(() => weightedPointOnPathInto({ x: 0, y: 0 }, commands, [1, 0, 0], () => 0.5)).toThrow(RangeError);
  });

  test('arc drawing segment도 weight 단위다', () => {
    // move(0,0) line(10,0) arc → drawing segment 2개. weights 길이 2.
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 20, y: 0 },
    ];
    // weights [0,1] → arc((10,0)~(20,0) 반원)만 선택. line max x=10이므로 x>10이면 arc 위 점이다.
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(out, commands, [0, 1], () => 0.5);
    expect(result).toBe(true);
    expect(out.x).toBeGreaterThan(10);
    expect(out.x).toBeLessThanOrEqual(20);
    // weight 길이 3은 mismatch
    expect(() => weightedPointOnPathInto({ x: 0, y: 0 }, commands, [1, 0, 0], () => 0.5)).toThrow(RangeError);
  });

  test('zero-length drawing segment는 effective 0이다', () => {
    // move(0,0) line(0,0) line(5,0): seg0 len0, seg1 len5
    const out = { x: -1, y: -1 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 0, y: 0 },
        { kind: 'line', x: 5, y: 0 },
      ],
      [10, 1],
      () => 0.5
    );
    expect(result).toBe(true);
    // seg1만 선택. threshold=0.5*5=2.5 → absolute=0+2.5 → (2.5,0)
    expect(out.x).toBeCloseTo(2.5);
    expect(out.y).toBeCloseTo(0);
  });

  test('모든 effective weight가 0이면 RangeError, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    expect(() =>
      weightedPointOnPathInto(
        out,
        [
          { kind: 'move', x: 0, y: 0 },
          { kind: 'line', x: 10, y: 0 },
        ],
        [0],
        () => {
          calls++;
          return 0.5;
        }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('invalid weight(NaN/Infinity/-Infinity/negative)는 RangeError', () => {
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    for (const bad of [Number.NaN, Infinity, -Infinity, -1]) {
      const out = { x: 7, y: 8 };
      expect(() => weightedPointOnPathInto(out, commands, [bad], () => 0.5)).toThrow(RangeError);
      expect(out).toEqual({ x: 7, y: 8 });
    }
  });

  test('weight length mismatch는 RangeError, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    expect(() =>
      weightedPointOnPathInto(
        out,
        [
          { kind: 'move', x: 0, y: 0 },
          { kind: 'line', x: 10, y: 0 },
        ],
        [1, 2],
        () => {
          calls++;
          return 0.5;
        }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('weight length mismatch는 curve flatten보다 먼저 평가된다', () => {
    const out = { x: 7, y: 8 };
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: Infinity, y1: 0, x2: 10, y2: 10, x: 20, y: 0 },
    ];
    expect(() => weightedPointOnPathInto(out, commands, [1, 1], () => 0.5)).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('invalid weight는 curve flatten보다 먼저 평가된다', () => {
    const out = { x: 7, y: 8 };
    const commands: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: Infinity, y1: 0, x2: 10, y2: 10, x: 20, y: 0 },
    ];
    expect(() => weightedPointOnPathInto(out, commands, [-1], () => 0.5)).toThrow(RangeError);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('empty path → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(out, [], [], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('move-only path → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(out, [{ kind: 'move', x: 0, y: 0 }], [], () => {
      calls++;
      return 0.5;
    });
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('zero-length path(동일 좌표 line) → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 3, y: 3 },
        { kind: 'line', x: 3, y: 3 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('NaN command path → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: NaN, y: 0 },
      ],
      [1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('Infinity command path → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: Infinity, y: 0 },
      ],
      [1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('-Infinity command path → false, out 미수정', () => {
    const out = { x: 7, y: 8 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: -Infinity, y: 0 },
      ],
      [1],
      () => 0.5
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
  });

  test('non-finite quadratic control point → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'quadratic', x1: Infinity, y1: 0, x: 10, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('non-finite cubic control point → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: Infinity, y1: 0, x2: 10, y2: 10, x: 20, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('non-finite arc parameter → false, out 미수정, RNG 미소비', () => {
    const out = { x: 7, y: 8 };
    let calls = 0;
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'arc', rx: Infinity, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 10, y: 0 },
      ],
      [1],
      () => {
        calls++;
        return 0.5;
      }
    );
    expect(result).toBe(false);
    expect(out).toEqual({ x: 7, y: 8 });
    expect(calls).toBe(0);
  });

  test('floating-point fallback: threshold가 totalEffective에 닿으면 마지막 positive segment 끝점', () => {
    // rng=()=>1로 fallback 진입을 강제하는 white-box 테스트(contract상 rng<1이지만 FP 경계에서 가능).
    // move(0,0) line(2,0) line(2,1): seg0 len2, seg1 len1. weights [1,8] → effective [2,8], total=10.
    // threshold=10 → strict `<` 모두 실패 → fallback이 마지막 positive segment(seg1) 끝점 (2,1).
    const out = { x: 0, y: 0 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 2, y: 0 },
        { kind: 'line', x: 2, y: 1 },
      ],
      [1, 8],
      () => 1
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(1);
  });

  test('fallback이 trailing zero-weight drawing segment를 건너뛴다(비-clamp-마스킹)', () => {
    // move(0,0) line(2,0) line(2,1) line(2,3): seg0 len2, seg1 len1, seg2 len2.
    // weights [1,1,0] → effective [2,1,0], total=3. rng=()=>1 → threshold=3 → main loop 미매치 →
    // fallback이 trailing zero-weight seg2를 tailLength로 누적해 건너뛰고 seg1 끝점 offset=3 → (2,1).
    // tailLength 뺄셈이 빠지면 offset=5 → clamp로 seg2 끝 (2,3)이 되어 단언이 깨진다(마스킹 아님).
    const out = { x: 0, y: 0 };
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 2, y: 0 },
        { kind: 'line', x: 2, y: 1 },
        { kind: 'line', x: 2, y: 3 },
      ],
      [1, 1, 0],
      () => 1
    );
    expect(result).toBe(true);
    expect(out.x).toBeCloseTo(2);
    expect(out.y).toBeCloseTo(1);
  });

  test('tuple output 지원', () => {
    const out: [number, number] = [0, 0];
    const result = weightedPointOnPathInto(
      out,
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
      ],
      [1],
      () => 0.5
    );
    expect(result).toBe(true);
    expect(out[0]).toBeCloseTo(5);
    expect(out[1]).toBeCloseTo(0);
  });

  test('성공 시 RNG를 정확히 1회 소비한다', () => {
    let calls = 0;
    const out = { x: 0, y: 0 };
    weightedPointOnPathInto(
      out,
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
});
