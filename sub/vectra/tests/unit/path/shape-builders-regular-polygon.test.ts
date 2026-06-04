/**
 * regularPolygonCommandsInto unit test.
 *
 * sides 3/4/6 정점 위치, sides < 3 / non-integer / NaN / Infinity guard, clockwise 옵션,
 * startAngle 회전, radius 0 / 음수 / non-finite pass-through를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { regularPolygonCommandsInto } from '../../../src/path/regular-polygon-commands-into';
import type { PathCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

describe('regularPolygonCommandsInto', () => {
  test('sides = 3 (삼각형): move + 2 line + close, 총 4 command', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, { x: 0, y: 0 }, 1, 3);
    expect(out).toHaveLength(4);
    expect(out[0].kind).toBe('move');
    expect(out[3].kind).toBe('close');
    // 기본 startAngle = -π/2 (위쪽 vertex).
    const move = out[0] as { kind: 'move'; x: number; y: number };
    expectClose(move.x, 0);
    expectClose(move.y, -1);
  });

  test('sides = 4 (사각형): clockwise 정점 위치', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 1, 4);
    expect(out).toHaveLength(5);
    // CW (y-down): (-π/2) → 0 → π/2 → π
    const expected = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    for (let i = 0; i < 4; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(cmd.x, expected[i][0]);
      expectClose(cmd.y, expected[i][1]);
    }
  });

  test('sides = 6 (육각형): 정점 6개와 close', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 2, 6);
    expect(out).toHaveLength(7);
    // 각 정점이 반지름 2 원 위에 있다.
    for (let i = 0; i < 6; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(Math.hypot(cmd.x, cmd.y), 2);
    }
  });

  test('sides < 3이면 out clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = regularPolygonCommandsInto(out, [0, 0], 1, 2);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('non-integer sides는 out clear만 한다', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 1, 3.5);
    expect(out).toEqual([]);
  });

  test('NaN/Infinity sides는 out clear만 한다', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 1, Number.NaN);
    expect(out).toEqual([]);
    regularPolygonCommandsInto(out, [0, 0], 1, Number.POSITIVE_INFINITY);
    expect(out).toEqual([]);
  });

  test('clockwise = false이면 CCW 진행', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 1, 4, { clockwise: false });
    // (-π/2) → -π → -3π/2(=π/2) → -2π(=0)
    const expected = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],
    ];
    for (let i = 0; i < 4; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(cmd.x, expected[i][0]);
      expectClose(cmd.y, expected[i][1]);
    }
  });

  test('startAngle 변경 시 첫 정점이 회전한다', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], 1, 4, { startAngle: 0 });
    const move = out[0] as { kind: 'move'; x: number; y: number };
    expectClose(move.x, 1);
    expectClose(move.y, 0);
  });

  test('radius = 0이면 모든 정점이 center', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [5, 5], 0, 6);
    for (let i = 0; i < 6; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(cmd.x, 5);
      expectClose(cmd.y, 5);
    }
  });

  test('radius < 0이면 모든 정점이 center', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [5, 5], -2, 6);
    for (let i = 0; i < 6; i++) {
      const cmd = out[i] as { x: number; y: number };
      expectClose(cmd.x, 5);
      expectClose(cmd.y, 5);
    }
  });

  test('non-finite radius는 그대로 흘린다', () => {
    const out: PathCommand[] = [];
    regularPolygonCommandsInto(out, [0, 0], Number.NaN, 3);
    const move = out[0] as { x: number; y: number };
    expect(Number.isNaN(move.x)).toBe(true);
    regularPolygonCommandsInto(out, [0, 0], Number.NEGATIVE_INFINITY, 3);
    const nonFiniteMove = out[0] as { x: number; y: number };
    expect(Number.isFinite(nonFiniteMove.x)).toBe(false);
  });
});
