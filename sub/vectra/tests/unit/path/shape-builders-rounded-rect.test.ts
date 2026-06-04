/**
 * roundedRectCommandsInto unit test.
 *
 * radius=0 / clamp / 일반 case command 구성, KAPPA 기반 corner cubic handle 위치,
 * 음수 width 위임, NaN radius pass-through, tuple input을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { rectCommandsInto } from '../../../src/path/rect-commands-into';
import { roundedRectCommandsInto } from '../../../src/path/rounded-rect-commands-into';
import type { CubicCommand, PathCommand } from '../../../src/types/index';
import { expectClose } from './_shape-builders-test-helpers';

const KAPPA = 0.5522847498;

describe('roundedRectCommandsInto', () => {
  test('radius = 0이면 rectCommandsInto와 동일한 5 command 결과', () => {
    const rounded: PathCommand[] = [];
    const plain: PathCommand[] = [];
    roundedRectCommandsInto(rounded, { x: 10, y: 20, width: 30, height: 40 }, 0);
    rectCommandsInto(plain, { x: 10, y: 20, width: 30, height: 40 });
    expect(rounded).toEqual(plain);
  });

  test('radius > min(w, h) / 2이면 min(w, h) / 2로 clamp된다', () => {
    const out: PathCommand[] = [];
    // width=20, height=10 → max radius = 5. radius=100 clamp → 5.
    roundedRectCommandsInto(out, { x: 0, y: 0, width: 20, height: 10 }, 100);
    // 시작점이 (0+5, 0) = (5, 0)이어야 한다.
    expect((out[0] as { kind: 'move'; x: number; y: number }).x).toBe(5);
    expect((out[0] as { kind: 'move'; x: number; y: number }).y).toBe(0);
  });

  test('일반 case: move + (line + cubic) × 4 + close, 총 10 command', () => {
    const out: PathCommand[] = [];
    roundedRectCommandsInto(out, { x: 0, y: 0, width: 100, height: 100 }, 10);
    expect(out).toHaveLength(10);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('line');
    expect(out[2].kind).toBe('cubic');
    expect(out[3].kind).toBe('line');
    expect(out[4].kind).toBe('cubic');
    expect(out[5].kind).toBe('line');
    expect(out[6].kind).toBe('cubic');
    expect(out[7].kind).toBe('line');
    expect(out[8].kind).toBe('cubic');
    expect(out[9].kind).toBe('close');
  });

  test('cubic handle 위치가 KAPPA 기반이다 (right-top corner)', () => {
    const out: PathCommand[] = [];
    // x=0, y=0, w=100, h=100, r=10. right-top corner: (100-10, 0) → (100, 0+10)
    roundedRectCommandsInto(out, { x: 0, y: 0, width: 100, height: 100 }, 10);
    const corner = out[2] as CubicCommand;
    const k = KAPPA * 10;
    expectClose(corner.x1, 100 - 10 + k);
    expectClose(corner.y1, 0);
    expectClose(corner.x2, 100);
    expectClose(corner.y2, 0 + 10 - k);
    expectClose(corner.x, 100);
    expectClose(corner.y, 10);
  });

  test('음수 width는 radius가 0으로 clamp되어 rectCommandsInto로 위임된다', () => {
    const rounded: PathCommand[] = [];
    const plain: PathCommand[] = [];
    roundedRectCommandsInto(rounded, { x: 0, y: 0, width: -10, height: 10 }, 3);
    rectCommandsInto(plain, { x: 0, y: 0, width: -10, height: 10 });
    expect(rounded).toEqual(plain);
  });

  test('NaN radius는 clamp 결과 NaN을 통해 invalid numeric pass-through로 흐른다', () => {
    const out: PathCommand[] = [];
    roundedRectCommandsInto(out, { x: 0, y: 0, width: 100, height: 100 }, Number.NaN);
    // NaN clamp 결과는 NaN이며 NaN !== 0이라 corner 분기로 진입한다.
    // 첫 command의 x = 0 + NaN = NaN이 그대로 흘러야 한다.
    const move = out[0] as { kind: 'move'; x: number; y: number };
    expect(Number.isNaN(move.x)).toBe(true);
  });

  test('rect tuple input도 지원한다', () => {
    const out: PathCommand[] = [];
    roundedRectCommandsInto(out, [0, 0, 100, 100], 0);
    const plain: PathCommand[] = [];
    rectCommandsInto(plain, [0, 0, 100, 100]);
    expect(out).toEqual(plain);
  });
});
