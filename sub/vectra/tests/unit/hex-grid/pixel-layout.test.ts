/**
 * hex-grid pixel layout(hexAxialToPixel* / hexPixelToAxial*) 계약 테스트.
 *
 * pointy default·flat orientation 산식, origin offset, tuple/object axial input, Into output subtype
 * 보존, axial → pixel → axial round-trip near equality, fractional 결과 비rounding, -0 canonicalize,
 * invalid size/origin/orientation/point RangeError, 각 성분 ±Infinity non-finite, computed overflow
 * non-finite RangeError와 validation 실패 시 out 미수정을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { hexAxialToPixel } from '../../../src/hex-grid/hex-axial-to-pixel';
import { hexAxialToPixelInto } from '../../../src/hex-grid/hex-axial-to-pixel-into';
import { hexPixelToAxial } from '../../../src/hex-grid/hex-pixel-to-axial';
import { hexPixelToAxialInto } from '../../../src/hex-grid/hex-pixel-to-axial-into';
import type { HexAxialWritable, HexOrientation, XYObjectWritable, XYTupleWritable } from '../../../src/types';

const SQRT3 = Math.sqrt(3);

describe('hexAxialToPixelInto / hexAxialToPixel - axial을 world pixel로', () => {
  test('pointy default orientation 산식을 고정한다', () => {
    const a = hexAxialToPixel({ q: 1, r: 0 }, { size: 10 });
    expect(a.x).toBeCloseTo(10 * SQRT3, 10);
    expect(a.y).toBeCloseTo(0, 10);

    const b = hexAxialToPixel({ q: 0, r: 1 }, { size: 10 });
    expect(b.x).toBeCloseTo(5 * SQRT3, 10);
    expect(b.y).toBeCloseTo(15, 10);
  });

  test('flat orientation 산식을 고정한다', () => {
    const a = hexAxialToPixel({ q: 1, r: 0 }, { size: 10, orientation: 'flat' });
    expect(a.x).toBeCloseTo(15, 10);
    expect(a.y).toBeCloseTo(5 * SQRT3, 10);
  });

  test('origin offset을 적용한다', () => {
    expect(hexAxialToPixel({ q: 0, r: 0 }, { size: 10, origin: { x: 5, y: 7 } })).toEqual({ x: 5, y: 7 });
  });

  test('tuple axial input을 object axial과 동일하게 처리한다', () => {
    const a = hexAxialToPixel([0, 1], { size: 10 });
    expect(a.x).toBeCloseTo(5 * SQRT3, 10);
    expect(a.y).toBeCloseTo(15, 10);
  });

  test('Into는 object output에 기록하고 같은 ref를 반환한다', () => {
    const out: XYObjectWritable = { x: 0, y: 0 };
    const result = hexAxialToPixelInto(out, { q: 0, r: 0 }, { size: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 0, y: 0 });
  });

  test('Into는 tuple output subtype에 기록한다', () => {
    const out: XYTupleWritable = [0, 0];
    const result = hexAxialToPixelInto(out, { q: 1, r: 0 }, { size: 10, orientation: 'flat' });
    expect(result).toBe(out);
    expect(out[0]).toBeCloseTo(15, 10);
    expect(out[1]).toBeCloseTo(5 * SQRT3, 10);
  });

  test('계산 결과 -0을 0으로 canonicalize한다', () => {
    const out = hexAxialToPixel({ q: 0, r: -0 }, { size: 10 });
    expect(Object.is(out.x, 0)).toBe(true);
    expect(Object.is(out.y, 0)).toBe(true);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('invalid size %s는 RangeError다', (size) => {
    expect(() => hexAxialToPixel({ q: 0, r: 0 }, { size })).toThrow(RangeError);
  });

  test('invalid orientation은 RangeError다', () => {
    expect(() => hexAxialToPixel({ q: 0, r: 0 }, { size: 10, orientation: 'skew' as HexOrientation })).toThrow(
      RangeError
    );
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite axial q/r %s는 RangeError다', (bad) => {
    expect(() => hexAxialToPixel({ q: bad, r: 0 }, { size: 10 })).toThrow(RangeError);
    expect(() => hexAxialToPixel({ q: 0, r: bad }, { size: 10 })).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite origin x/y %s는 RangeError다', (bad) => {
    expect(() => hexAxialToPixel({ q: 0, r: 0 }, { size: 10, origin: { x: bad, y: 0 } })).toThrow(RangeError);
    expect(() => hexAxialToPixel({ q: 0, r: 0 }, { size: 10, origin: { x: 0, y: bad } })).toThrow(RangeError);
  });

  test('계산 결과가 overflow해 non-finite가 되면 RangeError다', () => {
    expect(() => hexAxialToPixel({ q: 1e308, r: 0 }, { size: 1e308 })).toThrow(RangeError);
  });

  test('validation 실패 시 Into out을 수정하지 않는다', () => {
    const out: XYObjectWritable = { x: -7, y: -9 };
    expect(() => hexAxialToPixelInto(out, { q: 1, r: 1 }, { size: 0 })).toThrow(RangeError);
    expect(out).toEqual({ x: -7, y: -9 });
  });
});

describe('hexPixelToAxialInto / hexPixelToAxial - world pixel을 fractional axial로', () => {
  test('fractional axial을 반환하고 자동 rounding하지 않는다', () => {
    const a = hexPixelToAxial({ x: 10, y: 5 }, { size: 10 });
    expect(Number.isInteger(a.q) && Number.isInteger(a.r)).toBe(false);
  });

  test.each<HexOrientation>(['pointy', 'flat'])('%s axial → pixel → axial round-trip이 보존된다', (orientation) => {
    const layout = { size: 12, orientation, origin: { x: 3, y: -4 } };
    for (const q of [-2, -1, 0, 1, 2]) {
      for (const r of [-2, -1, 0, 1, 2]) {
        const pixel = hexAxialToPixel({ q, r }, layout);
        const back = hexPixelToAxial(pixel, layout);
        expect(back.q).toBeCloseTo(q, 9);
        expect(back.r).toBeCloseTo(r, 9);
      }
    }
  });

  test('tuple point input을 object point와 동일하게 처리한다', () => {
    const a = hexPixelToAxial([0, 0], { size: 10, origin: { x: 0, y: 0 } });
    expect(a).toEqual({ q: 0, r: 0 });
  });

  test('Into는 같은 ref를 반환하고 output subtype을 보존한다', () => {
    const out = { q: 0, r: 0, tag: 'keep' } as HexAxialWritable & { tag: string };
    const result = hexPixelToAxialInto(out, { x: 0, y: 0 }, { size: 10 });
    expect(result).toBe(out);
    expect(out.tag).toBe('keep');
  });

  test('계산 결과 -0을 0으로 canonicalize한다', () => {
    const out = hexPixelToAxial({ x: 0, y: 0 }, { size: 10, orientation: 'flat' });
    expect(Object.is(out.q, 0)).toBe(true);
    expect(Object.is(out.r, 0)).toBe(true);
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('invalid size %s는 RangeError다', (size) => {
    expect(() => hexPixelToAxial({ x: 0, y: 0 }, { size })).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite point x/y %s는 RangeError다', (bad) => {
    expect(() => hexPixelToAxial({ x: bad, y: 0 }, { size: 10 })).toThrow(RangeError);
    expect(() => hexPixelToAxial({ x: 0, y: bad }, { size: 10 })).toThrow(RangeError);
  });

  test.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-finite origin x/y %s는 RangeError다', (bad) => {
    expect(() => hexPixelToAxial({ x: 0, y: 0 }, { size: 10, origin: { x: bad, y: 0 } })).toThrow(RangeError);
    expect(() => hexPixelToAxial({ x: 0, y: 0 }, { size: 10, origin: { x: 0, y: bad } })).toThrow(RangeError);
  });

  test('계산 결과가 overflow해 non-finite가 되면 RangeError다', () => {
    expect(() => hexPixelToAxial({ x: 1e308, y: 0 }, { size: 1, origin: { x: -1e308, y: 0 } })).toThrow(RangeError);
  });

  test('validation 실패 시 Into out을 수정하지 않는다', () => {
    const out: HexAxialWritable = { q: -7, r: -9 };
    expect(() => hexPixelToAxialInto(out, { x: 1, y: 1 }, { size: 0 })).toThrow(RangeError);
    expect(out).toEqual({ q: -7, r: -9 });
  });
});
