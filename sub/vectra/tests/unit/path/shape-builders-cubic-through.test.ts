/**
 * cubicThroughCommandsInto unit test.
 *
 * t = 0.5 / 0.25에서 through 점 통과, controlScale 0/1/2 P1/P2 계산,
 * degenerate from == to, non-finite endpoint pass-through, aliasing 시 out 초기화,
 * t 옵션 control point 영향을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { cubicThroughCommandsInto } from '../../../src/path/cubic-through-commands-into';
import type { CubicCommand, PathCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

/**
 * 시작점과 cubic command를 받아 매개변수 t에서의 좌표를 Bernstein 기저로 계산한다.
 * through 점 통과 여부와 control handle 위치를 확인할 때 사용한다.
 */
function evaluateCubicAt(from: readonly [number, number], cubic: CubicCommand, t: number): readonly [number, number] {
  const u = 1 - t;
  const b0 = u * u * u;
  const b1 = 3 * u * u * t;
  const b2 = 3 * u * t * t;
  const b3 = t * t * t;
  return [
    b0 * from[0] + b1 * cubic.x1 + b2 * cubic.x2 + b3 * cubic.x,
    b0 * from[1] + b1 * cubic.y1 + b2 * cubic.y2 + b3 * cubic.y,
  ];
}

describe('cubicThroughCommandsInto', () => {
  test('기본 t = 0.5, controlScale = 1에서 through 점을 통과한다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0]);
    const cubic = out[1] as CubicCommand;
    const [x, y] = evaluateCubicAt([0, 0], cubic, 0.5);
    expectClose(x, 3);
    expectClose(y, 6);
  });

  test('t = 0.25, controlScale = 1에서 through 점을 통과한다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0], { t: 0.25 });
    const cubic = out[1] as CubicCommand;
    const [x, y] = evaluateCubicAt([0, 0], cubic, 0.25);
    expectClose(x, 3);
    expectClose(y, 6);
  });

  test('기본 controlScale = 1에서 P1, P2가 공식대로 계산된다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0]);
    const cubic = out[1] as CubicCommand;
    // P1 = from + (through - from) * 4/3 = (4, 8)
    expectClose(cubic.x1, 4);
    expectClose(cubic.y1, 8);
    // P2 = to + (through - to) * 4/3 = (6, 0) + (-3, 6) * 4/3 = (2, 8)
    expectClose(cubic.x2, 2);
    expectClose(cubic.y2, 8);
    expectClose(cubic.x, 6);
    expectClose(cubic.y, 0);
  });

  test('controlScale = 0이면 P1 = from, P2 = to (straight line cubic)', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0], { controlScale: 0 });
    const cubic = out[1] as CubicCommand;
    expectClose(cubic.x1, 0);
    expectClose(cubic.y1, 0);
    expectClose(cubic.x2, 6);
    expectClose(cubic.y2, 0);
  });

  test('controlScale = 2이면 control handle이 2배 늘어난다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0], { controlScale: 2 });
    const cubic = out[1] as CubicCommand;
    // P1 = from + (through - from) * 8/3 = (8, 16)
    expectClose(cubic.x1, 8);
    expectClose(cubic.y1, 16);
    expectClose(cubic.x2, -2);
    expectClose(cubic.y2, 16);
  });

  test('degenerate from == to도 cubic을 그대로 구성한다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [0, 0], [1, 1], [0, 0]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1].kind).toBe('cubic');
  });

  test('non-finite endpoint를 그대로 흘린다', () => {
    const out: PathCommand[] = [];
    cubicThroughCommandsInto(out, [Number.NaN, 0], [1, 1], [2, 0]);
    const cubic = out[1] as CubicCommand;
    expect(Number.isNaN(cubic.x1)).toBe(true);
  });

  test('aliasing: 기존 out content를 clear 후 기록한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }];
    cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0]);
    expect(out).toHaveLength(2);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
  });

  test('t 옵션이 control point 위치를 바꾼다', () => {
    const a: PathCommand[] = [];
    const b: PathCommand[] = [];
    cubicThroughCommandsInto(a, [0, 0], [3, 6], [6, 0], { t: 0.5 });
    cubicThroughCommandsInto(b, [0, 0], [3, 6], [6, 0], { t: 0.25 });
    expect(a).not.toEqual(b);
  });
});
