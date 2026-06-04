import { describe, expect, test } from 'vitest';
import { degToRad } from '../../../src/matrix/deg-to-rad';

describe('angle helper - degToRad', () => {
  test('180° → Math.PI (exact)', () => {
    expect(degToRad(180)).toBe(Math.PI);
  });

  test('90° → Math.PI / 2', () => {
    expect(degToRad(90)).toBe(Math.PI / 2);
  });

  test('0° → 0', () => {
    expect(degToRad(0)).toBe(0);
  });

  test('360° → 2 * Math.PI', () => {
    expect(degToRad(360)).toBe(2 * Math.PI);
  });

  test('음수 -90° → -Math.PI / 2', () => {
    expect(degToRad(-90)).toBe(-Math.PI / 2);
  });

  test('45° → Math.PI / 4', () => {
    expect(degToRad(45)).toBe(Math.PI / 4);
  });
});
