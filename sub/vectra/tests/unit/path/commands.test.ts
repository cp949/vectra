import { describe, expect, test, vi } from 'vitest';
import { commandCount } from '../../../src/path/command-count';
import { forEachCommand } from '../../../src/path/for-each-command';
import { isPathCommand } from '../../../src/path/is-path-command';
import { isPathCommandList } from '../../../src/path/is-path-command-list';
import { normalizeCommandsInto } from '../../../src/path/normalize-commands-into';
import { subpathCount } from '../../../src/path/subpath-count';
import type { PathCommand } from '../../../src/types/index';

// ──────────────────────────────────────────────
// isPathCommand
// ──────────────────────────────────────────────
describe('isPathCommand', () => {
  test('각 유효한 kind를 가진 object는 true를 반환한다', () => {
    expect(isPathCommand({ kind: 'move', x: 0, y: 0 })).toBe(true);
    expect(isPathCommand({ kind: 'line', x: 1, y: 2 })).toBe(true);
    expect(isPathCommand({ kind: 'quadratic', x1: 1, y1: 2, x: 3, y: 4 })).toBe(true);
    expect(isPathCommand({ kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 })).toBe(true);
    expect(isPathCommand({ kind: 'arc', rx: 10, ry: 10, xRotation: 0, largeArc: false, sweep: true, x: 5, y: 5 })).toBe(
      true
    );
    expect(isPathCommand({ kind: 'close' })).toBe(true);
  });

  test('null은 false를 반환한다', () => {
    expect(isPathCommand(null)).toBe(false);
  });

  test('undefined는 false를 반환한다', () => {
    expect(isPathCommand(undefined)).toBe(false);
  });

  test('string은 false를 반환한다', () => {
    expect(isPathCommand('move')).toBe(false);
  });

  test('number는 false를 반환한다', () => {
    expect(isPathCommand(42)).toBe(false);
  });

  test('배열은 false를 반환한다', () => {
    expect(isPathCommand([])).toBe(false);
  });

  test('유효하지 않은 kind 문자열은 false를 반환한다', () => {
    expect(isPathCommand({ kind: 'unknown' })).toBe(false);
    expect(isPathCommand({ kind: '' })).toBe(false);
    expect(isPathCommand({ kind: 'Move' })).toBe(false);
  });

  test('NaN x를 가진 MoveCommand는 true를 반환한다 (kind만 검사)', () => {
    expect(isPathCommand({ kind: 'move', x: Number.NaN, y: 0 })).toBe(true);
  });

  test('rx < 0인 ArcCommand는 true를 반환한다 (kind만 검사)', () => {
    expect(isPathCommand({ kind: 'arc', rx: -1, ry: 10, xRotation: 0, largeArc: false, sweep: true, x: 5, y: 5 })).toBe(
      true
    );
  });
});

// ──────────────────────────────────────────────
// isPathCommandList
// ──────────────────────────────────────────────
describe('isPathCommandList', () => {
  test('빈 배열은 true를 반환한다', () => {
    expect(isPathCommandList([])).toBe(true);
  });

  test('유효한 command 배열은 true를 반환한다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 10 }, { kind: 'close' }];
    expect(isPathCommandList(cmds)).toBe(true);
  });

  test('배열이 아니면 false를 반환한다', () => {
    expect(isPathCommandList(null)).toBe(false);
    expect(isPathCommandList(undefined)).toBe(false);
    expect(isPathCommandList('string')).toBe(false);
    expect(isPathCommandList(42)).toBe(false);
    expect(isPathCommandList({ kind: 'move', x: 0, y: 0 })).toBe(false);
  });

  test('하나라도 invalid command가 있으면 false를 반환한다', () => {
    expect(isPathCommandList([{ kind: 'move', x: 0, y: 0 }, { kind: 'invalid' }])).toBe(false);
    expect(isPathCommandList([null])).toBe(false);
    expect(isPathCommandList([undefined])).toBe(false);
    expect(isPathCommandList([{ kind: 'move', x: 0, y: 0 }, 42])).toBe(false);
  });
});

// ──────────────────────────────────────────────
// normalizeCommandsInto
// ──────────────────────────────────────────────
describe('normalizeCommandsInto', () => {
  test('commands가 비어 있으면 out을 빈 배열로 clear한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = normalizeCommandsInto(out, []);
    expect(result).toHaveLength(0);
    expect(result).toBe(out);
  });

  test('첫 command가 MoveCommand이면 암묵적 move를 삽입하지 않는다', () => {
    const move: PathCommand = { kind: 'move', x: 5, y: 10 };
    const line: PathCommand = { kind: 'line', x: 20, y: 30 };
    const out: PathCommand[] = [];
    normalizeCommandsInto(out, [move, line]);
    expect(out).toHaveLength(2);
    expect(out[0]).toBe(move);
    expect(out[1]).toBe(line);
  });

  test('첫 command가 MoveCommand가 아니면 origin move를 삽입한다', () => {
    const line: PathCommand = { kind: 'line', x: 10, y: 20 };
    const out: PathCommand[] = [];
    normalizeCommandsInto(out, [line]);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(out[1]).toBe(line);
  });

  test('입력 command object reference가 보존된다', () => {
    const move: PathCommand = { kind: 'move', x: 1, y: 2 };
    const close: PathCommand = { kind: 'close' };
    const out: PathCommand[] = [];
    normalizeCommandsInto(out, [move, close]);
    expect(out[0]).toBe(move);
    expect(out[1]).toBe(close);
  });

  test('반환값이 out과 동일한 reference이다', () => {
    const out: PathCommand[] = [];
    const result = normalizeCommandsInto(out, [{ kind: 'move', x: 0, y: 0 }]);
    expect(result).toBe(out);
  });

  test('out에 기존 내용이 있어도 clear 후 채워진다', () => {
    const stale: PathCommand = { kind: 'close' };
    const out: PathCommand[] = [stale, stale, stale];
    const move: PathCommand = { kind: 'move', x: 0, y: 0 };
    normalizeCommandsInto(out, [move]);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(move);
  });

  test('out이 commands와 같은 배열이어도 안전하게 처리된다 (output aliasing)', () => {
    // out과 commands가 같은 배열을 참조하는 경우: clear 전에 내용을 복사한 뒤 처리해야 한다
    const move: PathCommand = { kind: 'move', x: 3, y: 4 };
    const line: PathCommand = { kind: 'line', x: 5, y: 6 };
    const arr: PathCommand[] = [move, line];
    normalizeCommandsInto(arr, arr);
    // 첫 command가 move이므로 암묵적 move 없이 그대로 2개
    expect(arr).toHaveLength(2);
    expect(arr[0]).toBe(move);
    expect(arr[1]).toBe(line);
  });
});

// ──────────────────────────────────────────────
// commandCount
// ──────────────────────────────────────────────
describe('commandCount', () => {
  test('빈 배열은 0을 반환한다', () => {
    expect(commandCount([])).toBe(0);
  });

  test('N개 command가 있으면 N을 반환한다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 1, y: 1 }, { kind: 'close' }];
    expect(commandCount(cmds)).toBe(3);
  });
});

// ──────────────────────────────────────────────
// subpathCount
// ──────────────────────────────────────────────
describe('subpathCount', () => {
  test('빈 배열은 0을 반환한다', () => {
    expect(subpathCount([])).toBe(0);
  });

  test('MoveCommand가 없으면 0을 반환한다', () => {
    const cmds: PathCommand[] = [{ kind: 'line', x: 1, y: 1 }, { kind: 'close' }];
    expect(subpathCount(cmds)).toBe(0);
  });

  test('MoveCommand가 2개이면 2를 반환한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 30, y: 30 },
    ];
    expect(subpathCount(cmds)).toBe(2);
  });
});

// ──────────────────────────────────────────────
// forEachCommand
// ──────────────────────────────────────────────
describe('forEachCommand', () => {
  test('visitor가 command와 index를 올바르게 받는다', () => {
    const move: PathCommand = { kind: 'move', x: 0, y: 0 };
    const line: PathCommand = { kind: 'line', x: 1, y: 1 };
    const cmds: PathCommand[] = [move, line];

    const calls: Array<{ command: PathCommand; index: number }> = [];
    forEachCommand(cmds, (command, index) => {
      calls.push({ command, index });
    });

    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual({ command: move, index: 0 });
    expect(calls[1]).toEqual({ command: line, index: 1 });
  });

  test('빈 배열은 visitor를 호출하지 않는다', () => {
    const visitor = vi.fn();
    forEachCommand([], visitor);
    expect(visitor).not.toHaveBeenCalled();
  });

  test('visitor 호출 순서가 보장된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'quadratic', x1: 2, y1: 2, x: 3, y: 3 },
    ];
    const indices: number[] = [];
    forEachCommand(cmds, (_, i) => indices.push(i));
    expect(indices).toEqual([0, 1, 2]);
  });
});
