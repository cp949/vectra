/**
 * arcThroughCommandsInto unit test.
 *
 * 단위 원 위 3점 호 근사, collinear / 중복점 fallback, 반원 중점 위치, π sweep 다중 cubic 분할,
 * non-finite endpoint pass-through를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { arcThroughCommandsInto } from '../../../src/path/arc-through-commands-into';
import type { CubicCommand, PathCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

describe('arcThroughCommandsInto', () => {
  test('단위 원 위 3점: 단위 원 호를 근사한다', () => {
    const out: PathCommand[] = [];
    // 단위 원 위 (1, 0), (0, 1), (-1, 0): 위쪽 반원 (CCW)
    arcThroughCommandsInto(out, [1, 0], [0, 1], [-1, 0]);
    expect(out[0].kind).toBe('move');
    const move = out[0] as { x: number; y: number };
    expectClose(move.x, 1);
    expectClose(move.y, 0);
    // 마지막 cubic 끝점이 (-1, 0)
    const last = out[out.length - 1] as CubicCommand;
    expectClose(last.x, -1);
    expectClose(last.y, 0);
    // 모든 endpoint가 단위 원 위.
    expectClose(Math.hypot(last.x, last.y), 1);
  });

  test('collinear 3점이면 line fallback (Move + Line)', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [0, 0], [1, 1], [2, 2]);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 2 },
    ]);
  });

  test('from === to이면 line fallback', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [0, 0], [1, 1], [0, 0]);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ]);
  });

  test('from === through이면 line fallback', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [0, 0], [0, 0], [2, 0]);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
    ]);
  });

  test('through === to이면 line fallback', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [0, 0], [2, 0], [2, 0]);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 2, y: 0 },
    ]);
  });

  test('세 점 모두 동일이면 empty commands', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    arcThroughCommandsInto(out, [1, 1], [1, 1], [1, 1]);
    expect(out).toEqual([]);
  });

  test('단위 원 위 반원의 중점이 (0, 1)에 매우 가깝다', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [1, 0], [0, 1], [-1, 0]);
    // 반원 → 2개 cubic. 두 cubic의 경계점이 mid arc.
    // out: [move, cubic, cubic]. 첫 cubic의 끝점이 mid.
    const first = out[1] as CubicCommand;
    expectClose(first.x, 0, 1);
    expectClose(first.y, 1, 1);
  });

  test('큰 호(>π/2)는 다중 cubic 조각으로 분할된다', () => {
    const out: PathCommand[] = [];
    // 단위 원 위 (1,0) → (0,-1) [through, CW] → (-1,0): 아래 반원 (π sweep).
    // cross = (0-1)*(0-0) - (-1-0)*(-1-1) = 0 - 2 = -2 → CW 회전, π sweep → 2 cubic 조각.
    arcThroughCommandsInto(out, [1, 0], [0, -1], [-1, 0]);
    expect(out).toHaveLength(3); // move + 2 cubic
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('cubic');
    expect(out[2].kind).toBe('cubic');
  });

  test('non-finite endpoint를 그대로 흘린다 (cross가 NaN이라 collinear 분기를 우회)', () => {
    const out: PathCommand[] = [];
    arcThroughCommandsInto(out, [Number.NaN, 0], [0, 1], [-1, 0]);
    // cross = (0-NaN)*(0-0) - (1-0)*(-1-NaN) = NaN. collinear === 0 분기 안 걸린다.
    // numSegments = ceil(NaN/(π/2)) = NaN이라 for 루프가 실행되지 않고 move만 남는다.
    // throw 없이 NaN이 그대로 흐른 path invalid numeric pass-through 정책 확인.
    expect(out).toHaveLength(1);
    const move = out[0] as { kind: 'move'; x: number; y: number };
    expect(move.kind).toBe('move');
    expect(Number.isNaN(move.x)).toBe(true);
  });
});
