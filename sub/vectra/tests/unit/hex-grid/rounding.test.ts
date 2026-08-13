/**
 * hex-grid rounding(hexRound* ) 계약 테스트.
 *
 * fractional axial·cube input의 nearest integer axial rounding, cube delta correction 후
 * `q + r + s === 0` 복원, cube drift 허용, tuple/object input, non-finite input과 unsafe integer
 * result RangeError, implicit cube `s` overflow RangeError, Into same-ref·subtype 보존,
 * out === input self-aliasing 안전, -0 canonicalize, validation 실패 시 out 미수정을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexRound } from '../../../src/hex-grid/hex-round';
import { hexRoundInto } from '../../../src/hex-grid/hex-round-into';
import type { HexAxialWritable } from '../../../src/types';

describe('hexRoundInto / hexRound - fractional coordinate를 nearest integer axial로', () => {
  test('fractional axial을 nearest integer axial로 round한다', () => {
    expect(hexRound({ q: 1.2, r: 0.9 })).toEqual({ q: 1, r: 1 });
    expect(hexRound({ q: 0.1, r: -0.2 })).toEqual({ q: 0, r: 0 });
  });

  test('delta correction이 q + r + s === 0을 복원한다', () => {
    const result = hexRound({ q: 0.6, r: 0.6 });
    expect(result).toEqual({ q: 1, r: 0 });
    expect(result.q + result.r + (-result.q - result.r)).toBe(0);
  });

  test('fractional cube input의 drift를 허용하고 nearest axial을 반환한다', () => {
    expect(hexRound({ q: 0.4, r: 0.4, s: 0.4 })).toEqual({ q: 0, r: 0 });
    expect(hexRound({ q: 1.2, r: 0.9, s: -2.1 })).toEqual({ q: 1, r: 1 });
  });

  test('tuple axial과 tuple cube input을 처리한다', () => {
    expect(hexRound([1.2, 0.9])).toEqual({ q: 1, r: 1 });
    expect(hexRound([0.4, 0.4, 0.4])).toEqual({ q: 0, r: 0 });
  });

  test('결과 -0을 0으로 canonicalize한다', () => {
    const result = hexRound({ q: -0.1, r: 0.1 });
    expect(Object.is(result.q, 0)).toBe(true);
    expect(Object.is(result.r, 0)).toBe(true);
  });

  test('Into는 same ref를 반환하고 subtype을 보존한다', () => {
    const out = { q: 0, r: 0, tag: 'keep' } as HexAxialWritable & { tag: string };
    const result = hexRoundInto(out, { q: 1.2, r: 0.9 });
    expect(result).toBe(out);
    expect(out).toMatchObject({ q: 1, r: 1, tag: 'keep' });
  });

  test('Into는 out === input self-aliasing에서도 안전하다', () => {
    const io: HexAxialWritable = { q: 1.2, r: 0.9 };
    const result = hexRoundInto(io, io);
    expect(result).toBe(io);
    expect(io).toEqual({ q: 1, r: 1 });
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'non-finite axial q %s는 RangeError다',
    (q) => {
      expect(() => hexRound({ q, r: 0 })).toThrow(RangeError);
    }
  );

  test('unsafe integer result는 RangeError다', () => {
    expect(() => hexRound({ q: 2 ** 53, r: 0 })).toThrow(RangeError);
  });

  test('round 결과 q/r이 safe integer라도 implicit s가 unsafe integer면 RangeError다', () => {
    expect(() => hexRound({ q: Number.MAX_SAFE_INTEGER, r: Number.MAX_SAFE_INTEGER })).toThrow(RangeError);
  });

  test('validation 실패 시 Into out을 수정하지 않는다', () => {
    const out: HexAxialWritable = { q: -7, r: -9 };
    expect(() => hexRoundInto(out, { q: Number.NaN, r: 0 })).toThrow(RangeError);
    expect(out).toEqual({ q: -7, r: -9 });
  });
});
