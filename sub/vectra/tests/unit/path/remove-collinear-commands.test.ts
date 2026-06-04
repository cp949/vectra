import { describe, expect, test } from 'vitest';
import { removeCollinearCommandsInto } from '../../../src/path/remove-collinear-commands-into';
import type { PathCommand } from '../../../src/types/index';

describe('removeCollinearCommandsInto', () => {
  test('commands가 비어 있으면 out을 clear만 한다', () => {
    const out: PathCommand[] = [{ kind: 'close' }];
    const result = removeCollinearCommandsInto(out, []);
    expect(result).toBe(out);
    expect(result).toHaveLength(0);
  });

  test('직선 위 중간 LineCommand를 제거한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('연속된 collinear 중간점을 모두 제거한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
      { kind: 'line', x: 2, y: 2 },
      { kind: 'line', x: 3, y: 3 },
      { kind: 'line', x: 4, y: 4 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 4, y: 4 },
    ]);
  });

  test('non-collinear 경로는 변경하지 않는다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual(cmds);
  });

  test('zero-length LineCommand는 collinear로 간주해 제거한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 5, y: 5 },
      { kind: 'line', x: 10, y: 10 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 10 },
    ]);
  });

  test('angleTolerance 안의 미세 굴절은 제거한다', () => {
    // (0,0)→(5, 1e-9)→(10,0): 거의 직선. 기본 1e-10보다 큰 tolerance를 주면 제거된다.
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 1e-9 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds, { angleTolerance: 1e-3 });
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });

  test('angleTolerance 밖의 굴절은 보존한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 2 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds, { angleTolerance: 1e-10 });
    expect(out).toEqual(cmds);
  });

  test('Bezier/arc/Close는 그대로 통과한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'cubic', x1: 11, y1: 1, x2: 12, y2: 2, x: 13, y: 3 },
      { kind: 'quadratic', x1: 14, y1: 4, x: 15, y: 5 },
      { kind: 'arc', rx: 2, ry: 2, xRotation: 0, largeArc: false, sweep: true, x: 20, y: 5 },
      { kind: 'close' },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'cubic', x1: 11, y1: 1, x2: 12, y2: 2, x: 13, y: 3 },
      { kind: 'quadratic', x1: 14, y1: 4, x: 15, y: 5 },
      { kind: 'arc', rx: 2, ry: 2, xRotation: 0, largeArc: false, sweep: true, x: 20, y: 5 },
      { kind: 'close' },
    ]);
  });

  test('curve 사이 LineCommand는 양 끝 anchor 기준으로 판단한다', () => {
    // curve endpoint(0,0) → line(5,0) → curve via control. line은 curve endpoint와 다음 anchor 사이.
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 15, y: 0 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 15, y: 0 },
    ]);
  });

  test('subpath 경계(MoveCommand)를 넘어 collinear 판단하지 않는다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 20, y: 0 },
      { kind: 'line', x: 30, y: 0 },
    ];
    const out: PathCommand[] = [];
    removeCollinearCommandsInto(out, cmds);
    expect(out).toEqual(cmds);
  });

  test('out이 commands와 같은 배열이어도 안전하다 (aliasing)', () => {
    const arr: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    removeCollinearCommandsInto(arr, arr);
    expect(arr).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ]);
  });
});
