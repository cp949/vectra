/**
 * hex-grid line draw(hexLineDrawInto / hexLineDraw) 계약 테스트.
 *
 * same coordinate 단일 반환, adjacent [start, end], multi-step straight line start → end order,
 * oblique line의 deterministic rounded path, reverse direction order 유지, axial/cube tuple/object
 * input 혼합, cube invariant 위반·non-finite/non-integer/unsafe input·collection length(n+1>0xffffffff)
 * RangeError, hexLineDrawInto의
 * 같은 array ref 반환과 성공 시 content 교체, validation 실패 시 out 미수정, companion 새 plain
 * array 반환, 인접 cell distance 1 불변을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexLineDraw } from '../../../src/hex-grid/hex-line-draw';
import { hexLineDrawInto } from '../../../src/hex-grid/hex-line-draw-into';
import type { HexAxialWritable } from '../../../src/types';

// 두 axial cell이 인접(grid distance 1)한지 cube 성분으로 확인한다.
function isAdjacent(a: HexAxialWritable, b: HexAxialWritable): boolean {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs)) === 1;
}

describe('hexLineDrawInto - inclusive hex line traversal', () => {
  test('same coordinate는 start 한 개를 반환한다', () => {
    const out: HexAxialWritable[] = [];
    const result = hexLineDrawInto(out, { q: 2, r: 2 }, { q: 2, r: 2 });
    expect(result).toBe(out);
    expect(out).toEqual([{ q: 2, r: 2 }]);
  });

  test('adjacent coordinate는 [start, end]를 반환한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: 0, r: 0 }, { q: 1, r: 0 });
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ]);
  });

  test('multi-step straight line을 start → end order로 반환한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: 0, r: 0 }, { q: 3, r: 0 });
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
      { q: 3, r: 0 },
    ]);
  });

  test('r축 straight line을 처리한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: 0, r: 0 }, { q: 0, r: 3 });
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 0, r: 1 },
      { q: 0, r: 2 },
      { q: 0, r: 3 },
    ]);
  });

  test('oblique line은 deterministic rounded path를 반환한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: 0, r: 0 }, { q: 2, r: -1 });
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: -1 },
    ]);
  });

  test('reverse direction도 start → end order를 유지한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: 2, r: -1 }, { q: 0, r: 0 });
    expect(out).toEqual([
      { q: 2, r: -1 },
      { q: 1, r: 0 },
      { q: 0, r: 0 },
    ]);
  });

  test('연속한 cell은 grid distance 1로 인접한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, { q: -3, r: 1 }, { q: 4, r: -2 });
    for (let i = 1; i < out.length; i++) {
      expect(isAdjacent(out[i - 1], out[i])).toBe(true);
    }
    expect(out[0]).toEqual({ q: -3, r: 1 });
    expect(out[out.length - 1]).toEqual({ q: 4, r: -2 });
    expect(out).toHaveLength(8);
  });

  test('axial tuple과 cube object input을 혼합해 처리한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, [0, 0], { q: 1, r: 0, s: -1 });
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ]);
  });

  test('cube tuple input을 처리한다', () => {
    const out: HexAxialWritable[] = [];
    hexLineDrawInto(out, [0, 0, 0], [3, 0, -3]);
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
      { q: 3, r: 0 },
    ]);
  });

  test('cube invariant 위반은 RangeError다', () => {
    expect(() => hexLineDrawInto([], { q: 1, r: 1, s: 1 }, { q: 0, r: 0 })).toThrow(RangeError);
    expect(() => hexLineDrawInto([], { q: 0, r: 0 }, [1, 2, 0])).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('non-finite/non-integer/unsafe start q %s는 RangeError다', (q) => {
    expect(() => hexLineDrawInto([], { q, r: 0 }, { q: 0, r: 0 })).toThrow(RangeError);
  });

  test('결과 길이(n + 1)가 safe array length를 넘으면 RangeError이고 out을 수정하지 않는다', () => {
    const out: HexAxialWritable[] = [{ q: 7, r: 7 }];
    expect(() => hexLineDrawInto(out, { q: 0, r: 0 }, { q: 5_000_000_000, r: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ q: 7, r: 7 }]);
  });

  test('같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: HexAxialWritable[] = [
      { q: 9, r: 9 },
      { q: 8, r: 8 },
      { q: 7, r: 7 },
    ];
    const result = hexLineDrawInto(out, { q: 0, r: 0 }, { q: 1, r: 0 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
    ]);
  });

  test('validation 실패 시 기존 content를 보존한다', () => {
    const out: HexAxialWritable[] = [{ q: 1, r: 1 }];
    expect(() => hexLineDrawInto(out, { q: Number.NaN, r: 0 }, { q: 0, r: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ q: 1, r: 1 }]);
  });
});

describe('hexLineDraw - allocating companion', () => {
  test('새 plain { q, r }[] 배열을 반환한다', () => {
    expect(hexLineDraw({ q: 0, r: 0 }, { q: 2, r: 0 })).toEqual([
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: 2, r: 0 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    expect(hexLineDraw({ q: 0, r: 0 }, { q: 1, r: 0 })).not.toBe(hexLineDraw({ q: 0, r: 0 }, { q: 1, r: 0 }));
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => hexLineDraw({ q: 0, r: 0 }, { q: Number.NaN, r: 0 })).toThrow(RangeError);
  });
});
