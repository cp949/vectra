import { describe, expect, test } from 'vitest';
import { sanitizeCommands } from '../../../src/path/sanitize-commands';
import { sanitizeCommandsInto } from '../../../src/path/sanitize-commands-into';
import type { PathCommand } from '../../../src/types/index';

describe('sanitizeCommandsInto', () => {
  test('empty commands → out을 clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = sanitizeCommandsInto(out, []);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test('옵션이 모두 false면 입력을 그대로 복사한다 (reference 보존)', () => {
    const move: PathCommand = { kind: 'move', x: 0, y: 0 };
    const line: PathCommand = { kind: 'line', x: 5, y: 0 };
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, [move, line]);
    expect(out).toEqual([move, line]);
    expect(out[0]).toBe(move);
    expect(out[1]).toBe(line);
  });

  test('removeDuplicates: 직전과 동일 endpoint LineCommand를 제거한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('removeDuplicates: tolerance 안의 near-duplicate를 제거한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5 + 1e-4, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true, tolerance: 1e-3 });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('removeDuplicates: tolerance 밖이면 보존한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5 + 1e-4, y: 5 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true, tolerance: 1e-10 });
    expect(out).toEqual(cmds);
  });

  test('removeDuplicates: CloseCommand는 보존한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true });
    expect(out).toEqual(cmds);
  });

  test('removeDuplicates: MoveCommand는 동일 좌표여도 보존한다 (subpath 경계)', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'move', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true });
    expect(out).toEqual(cmds);
  });

  test('removeDuplicates: cubic/quadratic/arc도 endpoint 기준 duplicate 제거', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      { kind: 'quadratic', x1: 5, y1: 6, x: 5, y: 6 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true, x: 5, y: 6 },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      { kind: 'line', x: 10, y: 10 },
    ]);
  });

  test('removeCollinear: removeCollinearCommandsInto에 위임한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeCollinear: true });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('removeCollinear: tolerance가 angleTolerance로 전달된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 1e-9 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeCollinear: true, tolerance: 1e-3 });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('removeDuplicates + removeCollinear: duplicate를 먼저 제거하고 collinear를 적용한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 3, y: 0 },
      { kind: 'line', x: 3, y: 0 },
      { kind: 'line', x: 7, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true, removeCollinear: true });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('out이 commands와 같은 배열이어도 안전하다 (aliasing)', () => {
    const arr: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ];
    sanitizeCommandsInto(arr, arr, { removeDuplicates: true });
    expect(arr).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('non-finite 좌표 LineCommand는 비교 false라 그대로 보존된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: Number.NaN, y: 0 },
      { kind: 'line', x: Number.POSITIVE_INFINITY, y: 0 },
      { kind: 'line', x: Number.NEGATIVE_INFINITY, y: 0 },
    ];
    const out: PathCommand[] = [];
    sanitizeCommandsInto(out, cmds, { removeDuplicates: true, tolerance: 1 });
    expect(out).toEqual(cmds);
  });
});

describe('sanitizeCommands companion', () => {
  test('새 PathCommand 배열을 반환한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5, y: 5 },
    ];
    const result = sanitizeCommands(cmds, { removeDuplicates: true });
    expect(result).not.toBe(cmds);
    expect(result).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
    ]);
  });

  test('empty input → 새 빈 배열', () => {
    const cmds: PathCommand[] = [];
    const result = sanitizeCommands(cmds);
    expect(result).not.toBe(cmds);
    expect(result).toEqual([]);
  });
});
