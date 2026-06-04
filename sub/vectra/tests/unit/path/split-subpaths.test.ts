import { describe, expect, test } from 'vitest';
import { splitSubpathsInto } from '../../../src/path/split-subpaths-into';
import type { PathCommand } from '../../../src/types/index';

describe('splitSubpathsInto', () => {
  test('empty path는 out.length = 0만 수행한다 ([], [[]] 아님)', () => {
    const out: PathCommand[][] = [[{ kind: 'close' }]];
    const result = splitSubpathsInto(out, []);
    expect(result).toBe(out);
    expect(result).toEqual([]);
  });

  test('single subpath를 하나의 배열로 분리한다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }];
    const out: PathCommand[][] = [];
    splitSubpathsInto(out, cmds);
    expect(out).toEqual([[{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'close' }]]);
  });

  test('multi-subpath를 MoveCommand 기준으로 분리한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 30, y: 20 },
      { kind: 'close' },
    ];
    const out: PathCommand[][] = [];
    splitSubpathsInto(out, cmds);
    expect(out).toEqual([
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 10, y: 0 },
      ],
      [{ kind: 'move', x: 20, y: 20 }, { kind: 'line', x: 30, y: 20 }, { kind: 'close' }],
    ]);
  });

  test('첫 command가 MoveCommand가 아니면 암묵적 origin move를 prepend한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out: PathCommand[][] = [];
    splitSubpathsInto(out, cmds);
    expect(out).toEqual([
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 5, y: 5 },
        { kind: 'line', x: 10, y: 10 },
      ],
    ]);
  });

  test('각 subpath는 독립 배열이며 입력 command reference를 보존한다', () => {
    const move: PathCommand = { kind: 'move', x: 0, y: 0 };
    const line: PathCommand = { kind: 'line', x: 1, y: 1 };
    const out: PathCommand[][] = [];
    splitSubpathsInto(out, [move, line]);
    expect(out[0][0]).toBe(move);
    expect(out[0][1]).toBe(line);
  });

  test('out에 기존 내용이 있어도 clear 후 채워진다', () => {
    const out: PathCommand[][] = [[{ kind: 'close' }], [{ kind: 'close' }]];
    splitSubpathsInto(out, [
      { kind: 'move', x: 1, y: 1 },
      { kind: 'line', x: 2, y: 2 },
    ]);
    expect(out).toEqual([
      [
        { kind: 'move', x: 1, y: 1 },
        { kind: 'line', x: 2, y: 2 },
      ],
    ]);
  });
});
