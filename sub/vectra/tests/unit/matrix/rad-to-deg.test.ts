import { describe, expect, test } from 'vitest';
import { degToRad } from '../../../src/matrix/deg-to-rad';
import { radToDeg } from '../../../src/matrix/rad-to-deg';

describe('angle helper - radToDeg', () => {
  test('Math.PI → 180 (exact)', () => {
    expect(radToDeg(Math.PI)).toBe(180);
  });

  test('Math.PI / 2 → 90', () => {
    expect(radToDeg(Math.PI / 2)).toBe(90);
  });

  test('0 → 0', () => {
    expect(radToDeg(0)).toBe(0);
  });

  test('2 * Math.PI → 360', () => {
    expect(radToDeg(2 * Math.PI)).toBe(360);
  });

  test('음수 -Math.PI / 2 → -90', () => {
    expect(radToDeg(-Math.PI / 2)).toBe(-90);
  });

  test('Math.PI / 4 → 45', () => {
    expect(radToDeg(Math.PI / 4)).toBe(45);
  });

  test('degToRad(radToDeg(x)) roundtrip', () => {
    const deg = 37;
    expect(radToDeg(degToRad(deg))).toBeCloseTo(deg, 12);
  });
});
