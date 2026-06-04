/**
 * arcByEndpointCommandsInto unit test.
 *
 * move + arcCommand 2 command 기록, arcCommand 필드 보존(reference 공유),
 * rx/ry 0 또는 음수 비검증 push, non-finite from pass-through, aliasing 시 out 초기화를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { arcByEndpointCommandsInto } from '../../../src/path/arc-by-endpoint-commands-into';
import type { ArcCommand, PathCommand } from '../../../src/types/index';

describe('arcByEndpointCommandsInto', () => {
  test('move + arcCommand 2 command를 기록한다', () => {
    const out: PathCommand[] = [];
    const arc: ArcCommand = {
      kind: 'arc',
      rx: 5,
      ry: 3,
      xRotation: 0,
      largeArc: false,
      sweep: true,
      x: 10,
      y: 0,
    };
    const result = arcByEndpointCommandsInto(out, [0, 0], arc);
    expect(result).toBe(out);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1]).toBe(arc); // reference 공유
  });

  test('arcCommand의 모든 필드가 보존된다', () => {
    const out: PathCommand[] = [];
    const arc: ArcCommand = {
      kind: 'arc',
      rx: 7,
      ry: 4,
      xRotation: 0.25,
      largeArc: true,
      sweep: false,
      x: 12,
      y: 8,
    };
    arcByEndpointCommandsInto(out, { x: 1, y: 2 }, arc);
    expect(out[1]).toEqual(arc);
  });

  test('rx/ry가 0이거나 음수여도 validation 없이 push', () => {
    const out: PathCommand[] = [];
    const arc: ArcCommand = {
      kind: 'arc',
      rx: 0,
      ry: -3,
      xRotation: 0,
      largeArc: false,
      sweep: false,
      x: 1,
      y: 1,
    };
    arcByEndpointCommandsInto(out, [0, 0], arc);
    expect(out[1]).toBe(arc);
  });

  test('non-finite from을 그대로 흘린다', () => {
    const out: PathCommand[] = [];
    const arc: ArcCommand = {
      kind: 'arc',
      rx: 1,
      ry: 1,
      xRotation: 0,
      largeArc: false,
      sweep: true,
      x: 0,
      y: 0,
    };
    arcByEndpointCommandsInto(out, [Number.NaN, 0], arc);
    expect(Number.isNaN((out[0] as { x: number }).x)).toBe(true);
  });

  test('기존 out content를 clear 후 기록한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }];
    const arc: ArcCommand = {
      kind: 'arc',
      rx: 1,
      ry: 1,
      xRotation: 0,
      largeArc: false,
      sweep: true,
      x: 1,
      y: 1,
    };
    arcByEndpointCommandsInto(out, [0, 0], arc);
    expect(out).toHaveLength(2);
    expect(out[0].kind).toBe('move');
    expect(out[1].kind).toBe('arc');
  });
});
