/**
 * segmentCommandsInto unit test.
 *
 * 평평한 선분 입력으로 move + line 2 command를 기록하는 동작,
 * aliasing 시 out 초기화, non-finite endpoint pass-through를 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { segmentCommandsInto } from '../../../src/path/segment-commands-into';
import type { PathCommand } from '../../../src/types/index';

describe('segmentCommandsInto', () => {
  test('segment object를 move + line 2 command로 기록한다', () => {
    const out: PathCommand[] = [];
    const result = segmentCommandsInto(out, { x1: 1, y1: 2, x2: 3, y2: 4 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ]);
  });

  test('기존 out content를 clear 후 기록한다 (aliasing)', () => {
    const out: PathCommand[] = [{ kind: 'close' }, { kind: 'close' }, { kind: 'close' }];
    segmentCommandsInto(out, { x1: 0, y1: 0, x2: 1, y2: 1 });
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1]).toEqual({ kind: 'line', x: 1, y: 1 });
  });

  test('non-finite endpoint를 그대로 흘린다', () => {
    const out: PathCommand[] = [];
    segmentCommandsInto(out, { x1: Number.NaN, y1: 0, x2: 0, y2: Number.POSITIVE_INFINITY });
    expect(out[0]).toEqual({ kind: 'move', x: Number.NaN, y: 0 });
    expect(out[1]).toEqual({ kind: 'line', x: 0, y: Number.POSITIVE_INFINITY });
  });
});
