/**
 * quadraticThroughCommandsInto unit test.
 *
 * 기본 t = 0.5 / 사용자 t에서 through 점 통과, t = 0 / 1 invalid numeric pass-through,
 * degenerate from == to, non-finite endpoint pass-through, aliasing 시 out 초기화를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { quadraticThroughCommandsInto } from '../../../src/path/quadratic-through-commands-into';
import type { PathCommand, QuadraticCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

describe('quadraticThroughCommandsInto', () => {
  test('기본 t = 0.5에서 through 점을 통과한다', () => {
    const out: PathCommand[] = [];
    quadraticThroughCommandsInto(out, [0, 0], [1, 1], [2, 0]);
    const quad = out[1] as QuadraticCommand;
    // Q(0.5) = 0.25 * P0 + 0.5 * P1 + 0.25 * P2 = through
    const evalX = 0.25 * 0 + 0.5 * quad.x1 + 0.25 * 2;
    const evalY = 0.25 * 0 + 0.5 * quad.y1 + 0.25 * 0;
    expectClose(evalX, 1);
    expectClose(evalY, 1);
  });

  test('t = 0.25에서 through 점이 통과하도록 control point가 결정된다', () => {
    const out: PathCommand[] = [];
    const t = 0.25;
    quadraticThroughCommandsInto(out, [0, 0], [1, 2], [4, 0], { t });
    const quad = out[1] as QuadraticCommand;
    // Q(t) = (1-t)^2 * P0 + 2*t*(1-t) * P1 + t^2 * P2
    const u = 1 - t;
    const evalX = u * u * 0 + 2 * t * u * quad.x1 + t * t * 4;
    const evalY = u * u * 0 + 2 * t * u * quad.y1 + t * t * 0;
    expectClose(evalX, 1);
    expectClose(evalY, 2);
  });

  test('t = 0이면 P1이 ±Infinity 또는 NaN으로 흐른다 (invalid numeric pass-through)', () => {
    const out: PathCommand[] = [];
    quadraticThroughCommandsInto(out, [0, 0], [1, 1], [2, 0], { t: 0 });
    const quad = out[1] as QuadraticCommand;
    // (through - 1 * from - 0) / 0 = ±Infinity 또는 NaN
    expect(Number.isFinite(quad.x1)).toBe(false);
  });

  test('t = 1이면 P1이 non-finite로 흐른다', () => {
    const out: PathCommand[] = [];
    quadraticThroughCommandsInto(out, [0, 0], [1, 1], [2, 0], { t: 1 });
    const quad = out[1] as QuadraticCommand;
    expect(Number.isFinite(quad.x1)).toBe(false);
  });

  test('degenerate from == to도 quadratic을 그대로 구성한다', () => {
    const out: PathCommand[] = [];
    quadraticThroughCommandsInto(out, [0, 0], [1, 1], [0, 0]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1].kind).toBe('quadratic');
  });

  test('non-finite endpoint를 그대로 흘린다', () => {
    const out: PathCommand[] = [];
    quadraticThroughCommandsInto(out, [Number.POSITIVE_INFINITY, 0], [1, 1], [2, 0]);
    const quad = out[1] as QuadraticCommand;
    // P1 계산에 Infinity 좌표가 섞여 non-finite가 된다.
    expect(Number.isFinite(quad.x1)).toBe(false);
  });

  test('aliasing: 기존 out content를 clear 후 기록한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }];
    quadraticThroughCommandsInto(out, [0, 0], [1, 1], [2, 0]);
    expect(out).toHaveLength(2);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('quadratic');
  });
});
