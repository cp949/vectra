/**
 * TASK-02 command core helper unit tests.
 *
 * 대상: subpathAt, commandAt, subpathBounds, subpathBoundsInto, forEachSegment.
 */
import { describe, expect, test, vi } from 'vitest';
import { commandAt } from '../../../src/path/command-at';
import { forEachSegment } from '../../../src/path/for-each-segment';
import { subpathAt } from '../../../src/path/subpath-at';
import { subpathBounds } from '../../../src/path/subpath-bounds';
import { subpathBoundsInto } from '../../../src/path/subpath-bounds-into';
import type { BoundsWritable, PathCommand, PathSegment } from '../../../src/types/index';

/** sentinel bounds helper. */
function sentinelBounds(): BoundsWritable {
  return {
    min: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
    max: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
  };
}

/** writable bounds output 새로 생성. */
function makeBoundsOut(): BoundsWritable {
  return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
}

/** 두 subpath rect-shape path. */
const twoSubpathRect: PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 10, y: 0 },
  { kind: 'line', x: 10, y: 5 },
  { kind: 'line', x: 0, y: 5 },
  { kind: 'close' },
  { kind: 'move', x: 20, y: 20 },
  { kind: 'line', x: 30, y: 20 },
  { kind: 'line', x: 30, y: 25 },
  { kind: 'close' },
];

// ──────────────────────────────────────────────
// subpathAt
// ──────────────────────────────────────────────
describe('subpathAt', () => {
  test('multi-subpath path에서 각 index의 subpath를 반환한다', () => {
    const s0 = subpathAt(twoSubpathRect, 0);
    expect(s0).toBeDefined();
    expect(s0).toHaveLength(5);
    expect(s0?.[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(s0?.[4]).toEqual({ kind: 'close' });

    const s1 = subpathAt(twoSubpathRect, 1);
    expect(s1).toBeDefined();
    expect(s1).toHaveLength(4);
    expect(s1?.[0]).toEqual({ kind: 'move', x: 20, y: 20 });
  });

  test('invalid index(out-of-range / 음수 / empty / non-finite / non-integer)는 undefined를 반환한다', () => {
    expect(subpathAt(twoSubpathRect, 2)).toBeUndefined();
    expect(subpathAt(twoSubpathRect, -1)).toBeUndefined();
    expect(subpathAt([], 0)).toBeUndefined();
    expect(subpathAt(twoSubpathRect, Number.NaN)).toBeUndefined();
    expect(subpathAt(twoSubpathRect, 0.5)).toBeUndefined();
  });

  test('첫 command가 Move가 아닌 path는 암묵적 origin subpath를 index 0으로 반환한다', () => {
    const cmds: PathCommand[] = [{ kind: 'line', x: 5, y: 5 }];
    const s0 = subpathAt(cmds, 0);
    expect(s0).toBeDefined();
    expect(s0).toHaveLength(2);
    expect(s0?.[0]).toEqual({ kind: 'move', x: 0, y: 0 });
    expect(s0?.[1]).toEqual({ kind: 'line', x: 5, y: 5 });
  });

  test('반환 배열은 원본 commands와 다른 reference이다 (문서화된 fresh array contract)', () => {
    const result = subpathAt(twoSubpathRect, 0);
    expect(result).not.toBe(twoSubpathRect);
  });

  test('내부 command object reference는 그대로 재사용된다 (문서화된 contract)', () => {
    const move: PathCommand = { kind: 'move', x: 0, y: 0 };
    const line: PathCommand = { kind: 'line', x: 1, y: 1 };
    const cmds = [move, line];
    const s0 = subpathAt(cmds, 0);
    expect(s0?.[0]).toBe(move);
    expect(s0?.[1]).toBe(line);
  });
});

// ──────────────────────────────────────────────
// commandAt
// ──────────────────────────────────────────────
describe('commandAt', () => {
  test('정상 index에서 해당 command를 반환한다', () => {
    const move = twoSubpathRect[0];
    const last = twoSubpathRect[twoSubpathRect.length - 1];
    expect(commandAt(twoSubpathRect, 0)).toBe(move);
    expect(commandAt(twoSubpathRect, twoSubpathRect.length - 1)).toBe(last);
  });

  test('invalid index(out-of-range / 음수 / empty / non-finite / non-integer)는 undefined를 반환한다', () => {
    expect(commandAt(twoSubpathRect, twoSubpathRect.length)).toBeUndefined();
    expect(commandAt(twoSubpathRect, -1)).toBeUndefined();
    expect(commandAt([], 0)).toBeUndefined();
    expect(commandAt(twoSubpathRect, Number.NaN)).toBeUndefined();
    expect(commandAt(twoSubpathRect, 0.5)).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// subpathBounds
// ──────────────────────────────────────────────
describe('subpathBounds', () => {
  test('rect 1st subpath bounds', () => {
    const b = subpathBounds(twoSubpathRect, 0);
    expect(b.min).toEqual({ x: 0, y: 0 });
    expect(b.max).toEqual({ x: 10, y: 5 });
  });

  test('rect 2nd subpath bounds', () => {
    const b = subpathBounds(twoSubpathRect, 1);
    expect(b.min).toEqual({ x: 20, y: 20 });
    expect(b.max).toEqual({ x: 30, y: 25 });
  });

  test('multi-subpath bounds가 서로 독립적으로 계산된다', () => {
    const b0 = subpathBounds(twoSubpathRect, 0);
    const b1 = subpathBounds(twoSubpathRect, 1);
    expect(b0.min).not.toEqual(b1.min);
    expect(b0.max).not.toEqual(b1.max);
  });

  test('drawing segment가 없는 subpath는 sentinel bounds를 반환한다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 5, y: 7 }];
    const b = subpathBounds(cmds, 0);
    expect(b).toEqual(sentinelBounds());
  });

  test('out-of-range index는 sentinel bounds를 반환한다', () => {
    expect(subpathBounds(twoSubpathRect, 2)).toEqual(sentinelBounds());
    expect(subpathBounds(twoSubpathRect, -1)).toEqual(sentinelBounds());
  });

  test('empty path는 sentinel bounds를 반환한다', () => {
    expect(subpathBounds([], 0)).toEqual(sentinelBounds());
  });

  test('non-integer / NaN index는 sentinel bounds를 반환한다', () => {
    expect(subpathBounds(twoSubpathRect, Number.NaN)).toEqual(sentinelBounds());
    expect(subpathBounds(twoSubpathRect, 0.5)).toEqual(sentinelBounds());
    expect(subpathBounds(twoSubpathRect, Number.POSITIVE_INFINITY)).toEqual(sentinelBounds());
  });
});

// ──────────────────────────────────────────────
// subpathBoundsInto
// ──────────────────────────────────────────────
describe('subpathBoundsInto', () => {
  test('out 반환 동일성', () => {
    const out = makeBoundsOut();
    const result = subpathBoundsInto(out, twoSubpathRect, 0);
    expect(result).toBe(out);
  });

  test('정상 case에서 out에 bounds가 기록된다', () => {
    const out = makeBoundsOut();
    subpathBoundsInto(out, twoSubpathRect, 1);
    expect(out.min).toEqual({ x: 20, y: 20 });
    expect(out.max).toEqual({ x: 30, y: 25 });
  });

  test('out-of-range로 sentinel 기록 시 이전 값이 완전히 덮어쓰인다', () => {
    const out = makeBoundsOut();
    subpathBoundsInto(out, twoSubpathRect, 0);
    subpathBoundsInto(out, twoSubpathRect, 99);
    expect(out).toEqual(sentinelBounds());
  });
});

// ──────────────────────────────────────────────
// forEachSegment
// ──────────────────────────────────────────────
describe('forEachSegment', () => {
  test('empty path는 visitor를 호출하지 않는다', () => {
    const visitor = vi.fn();
    forEachSegment([], visitor);
    expect(visitor).not.toHaveBeenCalled();
  });

  test('line / quadratic / cubic / arc / close segment를 순서대로 노출한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'quadratic', x1: 2, y1: 0, x: 2, y: 1 },
      { kind: 'cubic', x1: 3, y1: 0, x2: 3, y2: 1, x: 4, y: 1 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true, x: 5, y: 2 },
      { kind: 'close' },
    ];
    const kinds: PathSegment['kind'][] = [];
    forEachSegment(cmds, (seg) => {
      kinds.push(seg.kind);
    });
    expect(kinds).toEqual(['line', 'quadratic', 'cubic', 'arc', 'close']);
  });

  test('quadratic으로 시작하는 subpath의 첫 segment는 startsSubpath: true', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'quadratic', x1: 1, y1: 1, x: 2, y: 0 },
      { kind: 'line', x: 3, y: 0 },
    ];
    const collected: Array<{ kind: PathSegment['kind']; startsSubpath: boolean }> = [];
    forEachSegment(cmds, (seg) => {
      if (seg.kind !== 'close') {
        collected.push({ kind: seg.kind, startsSubpath: seg.startsSubpath });
      }
    });
    expect(collected[0]).toEqual({ kind: 'quadratic', startsSubpath: true });
    expect(collected[1]).toEqual({ kind: 'line', startsSubpath: false });
  });

  test('cubic으로 시작하는 subpath의 첫 segment는 startsSubpath: true', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'cubic', x1: 1, y1: 1, x2: 2, y2: 1, x: 3, y: 0 },
      { kind: 'line', x: 4, y: 0 },
    ];
    const collected: Array<{ kind: PathSegment['kind']; startsSubpath: boolean }> = [];
    forEachSegment(cmds, (seg) => {
      if (seg.kind !== 'close') {
        collected.push({ kind: seg.kind, startsSubpath: seg.startsSubpath });
      }
    });
    expect(collected[0]).toEqual({ kind: 'cubic', startsSubpath: true });
    expect(collected[1]).toEqual({ kind: 'line', startsSubpath: false });
  });

  test('arc로 시작하는 subpath의 첫 segment는 startsSubpath: true', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'arc', rx: 1, ry: 1, xRotation: 0, largeArc: false, sweep: true, x: 2, y: 0 },
      { kind: 'line', x: 3, y: 0 },
    ];
    const collected: Array<{ kind: PathSegment['kind']; startsSubpath: boolean }> = [];
    forEachSegment(cmds, (seg) => {
      if (seg.kind !== 'close') {
        collected.push({ kind: seg.kind, startsSubpath: seg.startsSubpath });
      }
    });
    expect(collected[0]).toEqual({ kind: 'arc', startsSubpath: true });
    expect(collected[1]).toEqual({ kind: 'line', startsSubpath: false });
  });

  test('subpath의 첫 drawing segment는 startsSubpath: true', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ];
    const starts: boolean[] = [];
    forEachSegment(cmds, (seg) => {
      if (seg.kind !== 'close') {
        starts.push(seg.startsSubpath);
      }
    });
    expect(starts).toEqual([true, false]);
  });

  test('close segment는 startsSubpath: false로 노출된다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'line', x: 1, y: 0 }, { kind: 'close' }];
    let closeStartsSubpath: boolean | undefined;
    forEachSegment(cmds, (seg) => {
      if (seg.kind === 'close') {
        closeStartsSubpath = seg.startsSubpath;
      }
    });
    expect(closeStartsSubpath).toBe(false);
  });

  test('consecutive Move는 마지막 Move를 subpath start로 한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'move', x: 5, y: 5 },
      { kind: 'line', x: 6, y: 5 },
    ];
    let firstStart: { x: number; y: number } | undefined;
    forEachSegment(cmds, (seg) => {
      if (seg.kind === 'line' && firstStart === undefined) {
        firstStart = { x: seg.fromX, y: seg.fromY };
      }
    });
    expect(firstStart).toEqual({ x: 5, y: 5 });
  });

  test('close 직후 draw는 subpath start가 current point로 재사용된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'close' },
      { kind: 'line', x: 5, y: 5 },
    ];
    const segs: PathSegment[] = [];
    forEachSegment(cmds, (seg) => {
      segs.push(seg);
    });
    // 0번째 line, 1번째 close, 2번째 line — close 직후 line의 시작점은 subpath start (0,0)
    expect(segs).toHaveLength(3);
    expect(segs[2].kind).toBe('line');
    expect(segs[2].fromX).toBe(0);
    expect(segs[2].fromY).toBe(0);
    if (segs[2].kind !== 'close') {
      expect(segs[2].startsSubpath).toBe(true);
    }
    // close 직후 새 subpath start는 current point(close 후 (0,0))로 갱신된다
    expect(segs[2].subpathStartX).toBe(0);
    expect(segs[2].subpathStartY).toBe(0);
  });

  test('zero-length Move→Close는 visitor를 호출하지 않는다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 0, y: 0 }, { kind: 'close' }];
    const visitor = vi.fn();
    forEachSegment(cmds, visitor);
    expect(visitor).not.toHaveBeenCalled();
  });

  test('visitor 예외는 caller로 propagate된다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 0 },
    ];
    expect(() => {
      forEachSegment(cmds, () => {
        throw new Error('visitor exception');
      });
    }).toThrow('visitor exception');
  });

  test('subpathStartX/Y가 close segment에 올바르게 전달된다', () => {
    const cmds: PathCommand[] = [{ kind: 'move', x: 3, y: 4 }, { kind: 'line', x: 10, y: 4 }, { kind: 'close' }];
    let closeSeg: PathSegment | undefined;
    forEachSegment(cmds, (seg) => {
      if (seg.kind === 'close') {
        closeSeg = seg;
      }
    });
    expect(closeSeg).toBeDefined();
    if (closeSeg && closeSeg.kind === 'close') {
      expect(closeSeg.subpathStartX).toBe(3);
      expect(closeSeg.subpathStartY).toBe(4);
      expect(closeSeg.fromX).toBe(10);
      expect(closeSeg.fromY).toBe(4);
    }
  });

  test('options 인수를 받아도 동작에 영향이 없다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 1, y: 1 },
    ];
    const seenWithout: PathSegment['kind'][] = [];
    const seenWith: PathSegment['kind'][] = [];
    forEachSegment(cmds, (s) => seenWithout.push(s.kind));
    forEachSegment(cmds, (s) => seenWith.push(s.kind), { flatness: 0.5 });
    expect(seenWith).toEqual(seenWithout);
  });
});
