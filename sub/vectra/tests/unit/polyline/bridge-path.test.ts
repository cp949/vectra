/**
 * polyline path bridge helper unit test.
 *
 * toPath/fromPath helper의 clear/push/flatten edge-case 정책을 고정한다.
 */
import { describe, expect, test } from 'vitest';
import { flattenInto } from '../../../src/path/flatten-into';
import { polylineCommandsInto } from '../../../src/path/polyline-commands-into';
import { fromPath } from '../../../src/polyline/from-path';
import { fromPathInto } from '../../../src/polyline/from-path-into';
import { toPath } from '../../../src/polyline/to-path';
import { toPathInto } from '../../../src/polyline/to-path-into';
import type { PathCommand, PolylineLike } from '../../../src/types';

const EMPTY: PolylineLike = { points: [] };
const TWO_PT: PolylineLike = {
  points: [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
  ],
};
const THREE_PT: PolylineLike = {
  points: [
    { x: 0, y: 0 },
    { x: 3, y: 4 },
    { x: 6, y: 8 },
  ],
};

describe('polyline bridge/collection - toPathInto', () => {
  test('받은 command array 자체를 반환한다', () => {
    const out: PathCommand[] = [];
    expect(toPathInto(out, TWO_PT)).toBe(out);
  });

  test('빈 polyline이면 out을 clear하고 빈 command 배열을 반환한다', () => {
    const out: PathCommand[] = [{ kind: 'move', x: 9, y: 9 }];
    toPathInto(out, EMPTY);
    expect(out).toHaveLength(0);
  });

  test('single-point polyline은 move command 하나를 기록한다', () => {
    const out: PathCommand[] = [];
    toPathInto(out, { points: [{ x: 5, y: 7 }] });
    expect(out).toEqual([{ kind: 'move', x: 5, y: 7 }]);
  });

  test('two-point polyline은 move + line을 기록한다', () => {
    const out: PathCommand[] = [];
    toPathInto(out, TWO_PT);
    expect(out).toEqual([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ]);
  });

  test('three-point polyline은 move + line 2개를 기록한다', () => {
    const out: PathCommand[] = [];
    toPathInto(out, THREE_PT);
    expect(out).toEqual([
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 3, y: 4 },
      { kind: 'line', x: 6, y: 8 },
    ]);
  });

  test('tuple point input을 처리한다', () => {
    const out: PathCommand[] = [];
    toPathInto(out, {
      points: [
        [1, 2],
        [3, 4],
      ],
    });
    expect(out).toEqual([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ]);
  });

  test('기존 path.polylineCommandsInto와 같은 command sequence를 만든다', () => {
    expect(toPathInto([], THREE_PT)).toEqual(polylineCommandsInto([], THREE_PT));
  });
});

describe('polyline bridge/collection - toPath', () => {
  test('새 command 배열을 반환한다', () => {
    expect(toPath(TWO_PT)).toEqual([
      { kind: 'move', x: 1, y: 2 },
      { kind: 'line', x: 3, y: 4 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    expect(toPath(TWO_PT)).not.toBe(toPath(TWO_PT));
  });
});

describe('polyline bridge/collection - fromPathInto', () => {
  test('받은 point array 자체를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(fromPathInto(out, cmds)).toBe(out);
  });

  test('empty path는 out을 clear하고 빈 배열을 반환한다', () => {
    const out = [{ x: 9, y: 9 }];
    fromPathInto(out, []);
    expect(out).toHaveLength(0);
  });

  test('move-only path는 drawing segment가 없어 빈 배열을 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    fromPathInto(out, [{ kind: 'move', x: 5, y: 5 }]);
    expect(out).toHaveLength(0);
  });

  test('line path는 시작점과 line endpoint를 반환한다', () => {
    const out: { x: number; y: number }[] = [];
    fromPathInto(out, [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
    ]);
    expect(out).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  test('close command는 flatten 정책에 따라 close endpoint를 포함한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'line', x: 10, y: 10 },
      { kind: 'close' },
    ];
    // flatten internal helper와 동일한 정책을 따라야 한다.
    expect(fromPathInto([], cmds)).toEqual(flattenInto([], cmds));
  });

  test('quadratic path는 flatten options를 결과에 반영한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 50, y1: 100, x: 100, y: 0 },
    ];
    const coarse = fromPathInto([], cmds);
    const fine = fromPathInto([], cmds, { flatness: 0.01 });
    expect(fine.length).toBeGreaterThan(coarse.length);
    // 같은 옵션이면 flattenInto와 동일하다.
    expect(fine).toEqual(flattenInto([], cmds, { flatness: 0.01 }));
  });

  test('cubic/arc path도 flattenInto와 동일한 결과를 만든다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 0, y1: 100, x2: 100, y2: 100, x: 100, y: 0 },
      { kind: 'arc', rx: 50, ry: 50, xRotation: 0, largeArc: false, sweep: true, x: 0, y: 0 },
    ];
    expect(fromPathInto([], cmds)).toEqual(flattenInto([], cmds));
  });
});

describe('polyline bridge/collection - fromPath', () => {
  test('새 point 배열을 반환한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(fromPath(cmds)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  test('호출마다 다른 배열을 반환한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    expect(fromPath(cmds)).not.toBe(fromPath(cmds));
  });
});

describe('polyline bridge/collection - path non-finite 좌표 pass-through', () => {
  test('toPathInto는 NaN / Infinity / -Infinity 좌표를 그대로 전파한다', () => {
    // toEqual은 NaN을 NaN과 동등하게 비교한다.
    const out = toPathInto([], {
      points: [
        { x: Number.NaN, y: Number.POSITIVE_INFINITY },
        { x: Number.NEGATIVE_INFINITY, y: 5 },
      ],
    });
    expect(out).toEqual([
      { kind: 'move', x: Number.NaN, y: Number.POSITIVE_INFINITY },
      { kind: 'line', x: Number.NEGATIVE_INFINITY, y: 5 },
    ]);
  });

  test('fromPathInto는 non-finite 좌표에서 flattenInto와 동일하게 전파한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: Number.NaN, y: 0 },
      { kind: 'line', x: Number.POSITIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
    ];
    expect(fromPathInto([], cmds)).toEqual(flattenInto([], cmds));
  });
});
