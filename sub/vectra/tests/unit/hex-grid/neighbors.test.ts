/**
 * hex-grid neighbor(hexNeighborInto / hexNeighbor / hexNeighborsInto / hexNeighbors) 계약 테스트.
 *
 * direction 0..5의 clockwise axial order, tuple/object axial input, input/output aliasing,
 * invalid direction(범위 밖/non-integer/non-finite)·invalid axial·computed overflow RangeError,
 * hexNeighborsInto의 같은 array ref 반환과 성공 시 content 교체, validation 실패 시 out 미수정,
 * companion의 새 plain object/array 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexNeighbor } from '../../../src/hex-grid/hex-neighbor';
import { hexNeighborInto } from '../../../src/hex-grid/hex-neighbor-into';
import { hexNeighbors } from '../../../src/hex-grid/hex-neighbors';
import { hexNeighborsInto } from '../../../src/hex-grid/hex-neighbors-into';
import type { HexAxialWritable } from '../../../src/types';

// direction 0..5의 expected offset. 0:E, 1:NE, 2:NW, 3:W, 4:SW, 5:SE.
const DIRECTION_OFFSETS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
] as const;

describe('hexNeighborInto - 단일 방향 neighbor', () => {
  test('direction 0..5가 clockwise axial order대로 결과를 기록한다', () => {
    for (let d = 0; d < 6; d++) {
      const out: HexAxialWritable = { q: 0, r: 0 };
      const result = hexNeighborInto(out, { q: 3, r: -2 }, d);
      expect(result).toBe(out);
      expect(out).toEqual({ q: 3 + DIRECTION_OFFSETS[d].q, r: -2 + DIRECTION_OFFSETS[d].r });
    }
  });

  test('tuple axial input을 object axial과 동일하게 처리한다', () => {
    const out: HexAxialWritable = { q: 0, r: 0 };
    hexNeighborInto(out, [3, -2], 1);
    expect(out).toEqual({ q: 4, r: -3 });
  });

  test('input/output aliasing이 안전하다', () => {
    const cell: HexAxialWritable = { q: 5, r: 5 };
    const result = hexNeighborInto(cell, cell, 0);
    expect(result).toBe(cell);
    expect(cell).toEqual({ q: 6, r: 5 });
  });

  test.each([
    -1,
    6,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid direction %s는 RangeError다', (direction) => {
    expect(() => hexNeighborInto({ q: 0, r: 0 }, { q: 0, r: 0 }, direction)).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('invalid axial q %s는 RangeError다', (q) => {
    expect(() => hexNeighborInto({ q: 0, r: 0 }, { q, r: 0 }, 0)).toThrow(RangeError);
  });

  test('computed q overflow는 RangeError다', () => {
    const out: HexAxialWritable = { q: 7, r: 7 };
    expect(() => hexNeighborInto(out, { q: Number.MAX_SAFE_INTEGER, r: 0 }, 0)).toThrow(RangeError);
    expect(out).toEqual({ q: 7, r: 7 });
  });

  test('결과 q/r은 signed zero 없는 0이다', () => {
    const out: HexAxialWritable = { q: 0, r: 0 };
    hexNeighborInto(out, { q: -1, r: 0 }, 0);
    expect(Object.is(out.q, 0)).toBe(true);
  });
});

describe('hexNeighbor - allocating companion', () => {
  test('새 plain { q, r } object를 반환한다', () => {
    expect(hexNeighbor({ q: 0, r: 0 }, 2)).toEqual({ q: 0, r: -1 });
  });

  test('호출마다 서로 다른 새 object ref를 반환한다', () => {
    expect(hexNeighbor({ q: 0, r: 0 }, 0)).not.toBe(hexNeighbor({ q: 0, r: 0 }, 0));
  });

  test('invalid input에서 RangeError다', () => {
    expect(() => hexNeighbor({ q: 0, r: 0 }, 6)).toThrow(RangeError);
    expect(() => hexNeighbor({ q: Number.NaN, r: 0 }, 0)).toThrow(RangeError);
  });
});

describe('hexNeighborsInto - 6-neighbor collection', () => {
  test('direction 0..5 순서로 6개 neighbor를 기록한다', () => {
    const out: HexAxialWritable[] = [];
    const result = hexNeighborsInto(out, { q: 3, r: -2 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { q: 4, r: -2 },
      { q: 4, r: -3 },
      { q: 3, r: -3 },
      { q: 2, r: -2 },
      { q: 2, r: -1 },
      { q: 3, r: -1 },
    ]);
  });

  test('tuple axial input을 처리한다', () => {
    const out: HexAxialWritable[] = [];
    hexNeighborsInto(out, [0, 0]);
    expect(out).toEqual([
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ]);
  });

  test('같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: HexAxialWritable[] = [
      { q: 9, r: 9 },
      { q: 8, r: 8 },
    ];
    const result = hexNeighborsInto(out, { q: 0, r: 0 });
    expect(result).toBe(out);
    expect(out).toHaveLength(6);
    expect(out[0]).toEqual({ q: 1, r: 0 });
  });

  test('computed overflow 시 out을 수정하지 않는다', () => {
    const out: HexAxialWritable[] = [{ q: 7, r: 7 }];
    expect(() => hexNeighborsInto(out, { q: Number.MAX_SAFE_INTEGER, r: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ q: 7, r: 7 }]);
  });

  test('invalid axial 시 out을 수정하지 않는다', () => {
    const out: HexAxialWritable[] = [{ q: 7, r: 7 }];
    expect(() => hexNeighborsInto(out, { q: Number.NaN, r: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ q: 7, r: 7 }]);
  });
});

describe('hexNeighbors - allocating companion', () => {
  test('새 plain { q, r }[] 배열을 반환한다', () => {
    expect(hexNeighbors({ q: 0, r: 0 })).toEqual([
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    expect(hexNeighbors({ q: 0, r: 0 })).not.toBe(hexNeighbors({ q: 0, r: 0 }));
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => hexNeighbors({ q: Number.NaN, r: 0 })).toThrow(RangeError);
  });
});
