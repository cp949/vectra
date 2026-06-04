import { describe, expect, test } from 'vitest';
import { reverseCommandsInto } from '../../../src/path/reverse-commands-into';
import type { PathCommand } from '../../../src/types/index';

describe('reverseCommandsInto', () => {
  test('commands가 비어 있으면 out을 clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = reverseCommandsInto(out, []);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test('open single subpath를 반전한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 0, y: 0 },
    ]);
  });

  test('cubic/quadratic control point를 반전한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      { kind: 'quadratic', x1: 7, y1: 8, x: 9, y: 10 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 9, y: 10 },
      { kind: 'quadratic', x1: 7, y1: 8, x: 5, y: 6 },
      { kind: 'cubic', x1: 3, y1: 4, x2: 1, y2: 2, x: 0, y: 0 },
    ]);
  });

  test('arc는 endpoint를 반전하고 sweep을 flip한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 5, ry: 3, xRotation: 0.2, largeArc: true, sweep: true, x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 0 },
      { kind: 'arc', rx: 5, ry: 3, xRotation: 0.2, largeArc: true, sweep: false, x: 0, y: 0 },
    ]);
  });

  test('closed subpath M→L→L→Z는 반전 후도 M→L→L→Z 형태이다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 10, y: 10 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 0, y: 0 },
      { kind: 'close' },
    ]);
  });

  test('multi-subpath는 subpath 순서와 내부 command를 모두 반전한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 25, y: 20 },
      { kind: 'line', x: 30, y: 25 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 30, y: 25 },
      { kind: 'line', x: 25, y: 20 },
      { kind: 'line', x: 20, y: 20 },
      { kind: 'move', x: 5, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ]);
  });

  test('single point subpath는 그대로 둔다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 7, y: 9 },
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 3, y: 4 },
      { kind: 'line', x: 1, y: 2 },
      { kind: 'move', x: 7, y: 9 },
    ]);
  });

  test('첫 command가 MoveCommand가 아니면 암묵적 origin move를 가정한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'line', x: 4, y: 0 },
      { kind: 'line', x: 8, y: 0 },
    ];
    const out: PathCommand[] = [];
    reverseCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 8, y: 0 },
      { kind: 'line', x: 4, y: 0 },
      { kind: 'line', x: 0, y: 0 },
    ]);
  });

  test('반전 후 재반전하면 정규화된 원본과 같다', () => {
    const cases: PathCommand[][] = [
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'line', x: 5, y: 5 },
        { kind: 'line', x: 10, y: 0 },
      ],
      [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 10, y: 0 }, { kind: 'line', x: 10, y: 10 }, { kind: 'close' }],
      [
        { kind: 'move', x: 0, y: 0 },
        { kind: 'cubic', x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
        { kind: 'move', x: 20, y: 20 },
        { kind: 'quadratic', x1: 21, y1: 22, x: 23, y: 24 },
        { kind: 'close' },
      ],
    ];
    for (const cmds of cases) {
      const once: PathCommand[] = [];
      reverseCommandsInto(once, cmds);
      const twice: PathCommand[] = [];
      reverseCommandsInto(twice, once);
      expect(twice).toEqual(cmds);
    }
  });
});
