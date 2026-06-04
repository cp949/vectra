import { describe, expect, test } from 'vitest';
import { sdfOrientedRect } from '../../../src/sdf/sdf-oriented-rect';
import { sdfRect } from '../../../src/sdf/sdf-rect';
import { NON_FINITE } from './_sdf-test-helpers';

describe('sdfOrientedRect', () => {
  test('angle 0은 같은 region sdfRect와 같은 결과를 반환한다', () => {
    // region [0,10] x [0,4], center (5,2)
    const rect = { x: 0, y: 0, width: 10, height: 4 };
    const obb = { center: { x: 5, y: 2 }, size: { x: 10, y: 4 }, angle: 0 };
    for (const p of [
      { x: 5, y: 2 }, // center interior
      { x: 1, y: 2 }, // left-biased interior
      { x: 0, y: 2 }, // left edge boundary
      { x: 10, y: 4 }, // corner boundary
      { x: 13, y: 2 }, // axis exterior
      { x: 13, y: 6 }, // diagonal exterior
    ]) {
      expect(sdfOrientedRect(obb, p)).toBeCloseTo(sdfRect(rect, p), 12);
    }
  });

  test('rotated rect inside point는 음수를 반환한다', () => {
    // center origin, size (4,2), angle 90° → world span x∈[-1,1], y∈[-2,2]
    const obb = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 };
    // center nearest edge는 ±1 (rotated height/2)
    expect(sdfOrientedRect(obb, { x: 0, y: 0 })).toBeCloseTo(-1, 12);
  });

  test('rotated rect edge boundary point는 0을 반환한다', () => {
    const obb = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 };
    // local y = +1 boundary → world (-1, 0)
    expect(sdfOrientedRect(obb, { x: -1, y: 0 })).toBeCloseTo(0, 12);
    // local y = -1 boundary → world (1, 0)
    expect(sdfOrientedRect(obb, { x: 1, y: 0 })).toBeCloseTo(0, 12);
  });

  test('rotated rect exterior point는 양수 distance를 반환한다', () => {
    const obb = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: Math.PI / 2 };
    // (3,0): local (0,-3), qy = 2 → distance 2
    expect(sdfOrientedRect(obb, { x: 3, y: 0 })).toBeCloseTo(2, 12);
    // (3,3): local (3,-3), q = (1,2) → sqrt(5)
    expect(sdfOrientedRect(obb, { x: 3, y: 3 })).toBeCloseTo(Math.sqrt(5), 12);
  });

  test('tuple input과 object input이 같은 결과를 반환한다', () => {
    const fromObject = sdfOrientedRect({ center: { x: 5, y: 2 }, size: { x: 10, y: 4 }, angle: 0 }, { x: 13, y: 2 });
    const fromTuple = sdfOrientedRect([[5, 2], [10, 4], 0], [13, 2]);
    expect(fromTuple).toBe(fromObject);
    expect(fromTuple).toBe(3);
  });

  test('zero width degenerate는 같은 region sdfRect segment distance와 일치한다', () => {
    // x=5 수직 segment, y∈[0,4]
    const obb = { center: { x: 5, y: 2 }, size: { x: 0, y: 4 }, angle: 0 };
    const line = { x: 5, y: 0, width: 0, height: 4 };
    for (const p of [
      { x: 5, y: 2 }, // on segment
      { x: 8, y: 2 }, // off to the side
      { x: 5, y: 6 }, // past endpoint
    ]) {
      expect(sdfOrientedRect(obb, p)).toBeCloseTo(sdfRect(line, p), 12);
    }
  });

  test('zero height degenerate는 같은 region sdfRect segment distance와 일치한다', () => {
    // y=2 수평 segment, x∈[0,4]
    const obb = { center: { x: 2, y: 2 }, size: { x: 4, y: 0 }, angle: 0 };
    const line = { x: 0, y: 2, width: 4, height: 0 };
    for (const p of [
      { x: 2, y: 2 }, // on segment
      { x: 2, y: 5 }, // off to the side
      { x: 6, y: 2 }, // past endpoint
    ]) {
      expect(sdfOrientedRect(obb, p)).toBeCloseTo(sdfRect(line, p), 12);
    }
  });

  test('zero area degenerate는 point distance를 반환한다', () => {
    const obb = { center: { x: 2, y: 3 }, size: { x: 0, y: 0 }, angle: 0.7 };
    expect(sdfOrientedRect(obb, { x: 2, y: 3 })).toBe(0);
    expect(sdfOrientedRect(obb, { x: 5, y: 7 })).toBeCloseTo(5, 12);
  });

  test('boundary 결과는 -0이 아닌 0이다', () => {
    const obb = { center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 };
    expect(Object.is(sdfOrientedRect(obb, { x: 2, y: 0 }), 0)).toBe(true);
  });

  test('negative size.x는 RangeError다', () => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: -1, y: 4 }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test('negative size.y는 RangeError다', () => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: 4, y: -1 }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite center.x %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: bad, y: 0 }, size: { x: 4, y: 2 }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite center.y %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: bad }, size: { x: 4, y: 2 }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite size.x %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: bad, y: 2 }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite size.y %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: 4, y: bad }, angle: 0 }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite angle %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: bad }, { x: 0, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite point.x %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 }, { x: bad, y: 0 })).toThrow(
      RangeError
    );
  });

  test.each(NON_FINITE)('non-finite point.y %p는 RangeError다', (bad) => {
    expect(() => sdfOrientedRect({ center: { x: 0, y: 0 }, size: { x: 4, y: 2 }, angle: 0 }, { x: 0, y: bad })).toThrow(
      RangeError
    );
  });
});
