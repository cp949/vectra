/**
 * hex-grid ring(hexRingInto / hexRing) 계약 테스트.
 *
 * radius 0 center 단일 반환, radius 1/2 perimeter deterministic order(direction 4 시작 corner에서
 * direction 0..5를 radius step씩), 길이 6*r, tuple/object center input, invalid center·invalid
 * radius(음수/non-integer/non-finite)·computed overflow·collection length(6*radius>0xffffffff) RangeError,
 * hexRingInto의 같은 array ref
 * 반환과 성공 시 content 교체, validation 실패 시 out 미수정, companion의 새 plain array 반환을
 * 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexRing } from '../../../src/hex-grid/hex-ring';
import { hexRingInto } from '../../../src/hex-grid/hex-ring-into';
import type { HexAxialWritable } from '../../../src/types';

describe('hexRingInto - radius perimeter collection', () => {
  test('radius 0은 center 한 개를 반환한다', () => {
    const out: HexAxialWritable[] = [];
    const result = hexRingInto(out, { q: 3, r: -2 }, 0);
    expect(result).toBe(out);
    expect(out).toEqual([{ q: 3, r: -2 }]);
  });

  test('radius 1은 6개 cell을 deterministic order로 반환한다', () => {
    const out: HexAxialWritable[] = [];
    hexRingInto(out, { q: 0, r: 0 }, 1);
    expect(out).toEqual([
      { q: -1, r: 1 },
      { q: 0, r: 1 },
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
    ]);
  });

  test('radius 2는 12개 cell을 deterministic order로 반환한다', () => {
    const out: HexAxialWritable[] = [];
    hexRingInto(out, { q: 0, r: 0 }, 2);
    expect(out).toHaveLength(12);
    expect(out).toEqual([
      { q: -2, r: 2 },
      { q: -1, r: 2 },
      { q: 0, r: 2 },
      { q: 1, r: 1 },
      { q: 2, r: 0 },
      { q: 2, r: -1 },
      { q: 2, r: -2 },
      { q: 1, r: -2 },
      { q: 0, r: -2 },
      { q: -1, r: -1 },
      { q: -2, r: 0 },
      { q: -2, r: 1 },
    ]);
  });

  test('center offset을 각 cell에 더한다', () => {
    const out: HexAxialWritable[] = [];
    hexRingInto(out, { q: 10, r: -5 }, 1);
    expect(out).toEqual([
      { q: 9, r: -4 },
      { q: 10, r: -4 },
      { q: 11, r: -5 },
      { q: 11, r: -6 },
      { q: 10, r: -6 },
      { q: 9, r: -5 },
    ]);
  });

  test('tuple center input을 object center와 동일하게 처리한다', () => {
    const out: HexAxialWritable[] = [];
    hexRingInto(out, [0, 0], 1);
    expect(out).toEqual([
      { q: -1, r: 1 },
      { q: 0, r: 1 },
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
    ]);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('invalid center q %s는 RangeError다', (q) => {
    expect(() => hexRingInto([], { q, r: 0 }, 1)).toThrow(RangeError);
  });

  test.each([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('invalid radius %s는 RangeError다', (radius) => {
    expect(() => hexRingInto([], { q: 0, r: 0 }, radius)).toThrow(RangeError);
  });

  test('computed q overflow 시 out을 수정하지 않는다', () => {
    const out: HexAxialWritable[] = [{ q: 7, r: 7 }];
    expect(() => hexRingInto(out, { q: Number.MAX_SAFE_INTEGER, r: 0 }, 1)).toThrow(RangeError);
    expect(out).toEqual([{ q: 7, r: 7 }]);
  });

  test('ring cell 개수(6 * radius)가 safe array length를 넘으면 RangeError이고 out을 수정하지 않는다', () => {
    const out: HexAxialWritable[] = [{ q: 7, r: 7 }];
    expect(() => hexRingInto(out, { q: 0, r: 0 }, 800_000_000)).toThrow(RangeError);
    expect(out).toEqual([{ q: 7, r: 7 }]);
  });

  test('같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: HexAxialWritable[] = [
      { q: 9, r: 9 },
      { q: 8, r: 8 },
      { q: 7, r: 7 },
    ];
    const result = hexRingInto(out, { q: 0, r: 0 }, 1);
    expect(result).toBe(out);
    expect(out).toHaveLength(6);
  });

  test('validation 실패 시 기존 content를 보존한다', () => {
    const out: HexAxialWritable[] = [{ q: 1, r: 1 }];
    expect(() => hexRingInto(out, { q: 0, r: 0 }, -1)).toThrow(RangeError);
    expect(out).toEqual([{ q: 1, r: 1 }]);
  });
});

describe('hexRing - allocating companion', () => {
  test('radius 0은 새 배열에 center 한 개를 담아 반환한다', () => {
    expect(hexRing({ q: 2, r: 3 }, 0)).toEqual([{ q: 2, r: 3 }]);
  });

  test('새 plain { q, r }[] 배열을 반환한다', () => {
    expect(hexRing({ q: 0, r: 0 }, 1)).toEqual([
      { q: -1, r: 1 },
      { q: 0, r: 1 },
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
    ]);
  });

  test('호출마다 서로 다른 새 array ref를 반환한다', () => {
    expect(hexRing({ q: 0, r: 0 }, 1)).not.toBe(hexRing({ q: 0, r: 0 }, 1));
  });

  test('companion도 invalid input에서 RangeError다', () => {
    expect(() => hexRing({ q: 0, r: 0 }, -1)).toThrow(RangeError);
  });
});
