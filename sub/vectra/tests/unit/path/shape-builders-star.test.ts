/**
 * starCommandsInto unit test.
 *
 * 5-point star command 수와 outer/inner 교차 반지름, inner == outer 동등성,
 * inner > outer 입력 그대로 사용, points 가드 (< 3 / non-integer / NaN / Infinity),
 * clockwise = false CCW 진행을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { starCommandsInto } from '../../../src/path/star-commands-into';
import type { PathCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

describe('starCommandsInto', () => {
  test('5-point star: 2 * 5 + 1 = 11 command. outer/inner 교차 반지름', () => {
    const out: PathCommand[] = [];
    starCommandsInto(out, [0, 0], 1, 2, 5);
    expect(out).toHaveLength(11);
    expect(out[0].kind).toBe('move');
    expect(out[10].kind).toBe('close');
    // index 0 (move) → outer (r=2), index 1 → inner (r=1), index 2 → outer, ...
    for (let i = 0; i < 10; i++) {
      const cmd = out[i] as { x: number; y: number };
      const expectedR = i % 2 === 0 ? 2 : 1;
      expectClose(Math.hypot(cmd.x, cmd.y), expectedR);
    }
  });

  test('inner == outer이면 regular polygon과 동등한 vertex 거리', () => {
    const out: PathCommand[] = [];
    starCommandsInto(out, [0, 0], 1, 1, 5);
    expect(out).toHaveLength(11);
    for (let i = 0; i < 10; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(Math.hypot(cmd.x, cmd.y), 1);
    }
  });

  test('inner > outer도 그대로 사용한다 (caller 책임)', () => {
    const out: PathCommand[] = [];
    starCommandsInto(out, [0, 0], 5, 1, 5);
    // 입력 순서는 (innerRadius=5, outerRadius=1). index 0이 outer=1, index 1이 inner=5.
    const move = out[0] as { x: number; y: number };
    expectClose(Math.hypot(move.x, move.y), 1);
    const second = out[1] as { x: number; y: number };
    expectClose(Math.hypot(second.x, second.y), 5);
  });

  test('points < 3이면 out clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    starCommandsInto(out, [0, 0], 1, 2, 2);
    expect(out).toEqual([]);
  });

  test('non-integer/NaN/Infinity points는 out clear만 한다', () => {
    const out: PathCommand[] = [];
    starCommandsInto(out, [0, 0], 1, 2, 3.5);
    expect(out).toEqual([]);
    starCommandsInto(out, [0, 0], 1, 2, Number.NaN);
    expect(out).toEqual([]);
    starCommandsInto(out, [0, 0], 1, 2, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('clockwise = false이면 CCW 진행', () => {
    const out: PathCommand[] = [];
    starCommandsInto(out, [0, 0], 1, 2, 4, { clockwise: false });
    // outer step = -π/4. index 0 (-π/2)는 outer (0, -2).
    const move = out[0] as { x: number; y: number };
    expectClose(move.x, 0);
    expectClose(move.y, -2);
    // index 1 (-π/2 - π/4 = -3π/4)는 inner.
    const second = out[1] as { x: number; y: number };
    expectClose(Math.hypot(second.x, second.y), 1);
  });
});
