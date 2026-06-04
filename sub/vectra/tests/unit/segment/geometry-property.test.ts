/**
 * segment scalar property helpers — width, height, normalAngle
 */
import { describe, expect, test } from 'vitest';
import { height } from '../../../src/segment/height';
import { normalAngle } from '../../../src/segment/normal-angle';
import { width } from '../../../src/segment/width';

describe('segment scalar property - width', () => {
  test('object endpoint segment의 width를 반환한다', () => {
    expect(width({ a: { x: 1, y: 0 }, b: { x: 4, y: 0 } })).toBe(3);
  });

  test('reversed endpoint segment의 width는 음수가 아니다', () => {
    expect(width({ a: { x: 4, y: 0 }, b: { x: 1, y: 0 } })).toBe(3);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      width([
        [0, 0],
        [5, 3],
      ])
    ).toBe(5);
  });

  test('vertical segment의 width는 0이다', () => {
    expect(width({ a: { x: 2, y: 0 }, b: { x: 2, y: 5 } })).toBe(0);
  });

  test('zero-length segment의 width는 0이다', () => {
    expect(width({ a: { x: 3, y: 3 }, b: { x: 3, y: 3 } })).toBe(0);
  });
});

describe('segment scalar property - height', () => {
  test('object endpoint segment의 height를 반환한다', () => {
    expect(height({ a: { x: 0, y: 1 }, b: { x: 0, y: 5 } })).toBe(4);
  });

  test('reversed endpoint segment의 height는 음수가 아니다', () => {
    expect(height({ a: { x: 0, y: 5 }, b: { x: 0, y: 1 } })).toBe(4);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      height([
        [0, 0],
        [3, 5],
      ])
    ).toBe(5);
  });

  test('horizontal segment의 height는 0이다', () => {
    expect(height({ a: { x: 0, y: 2 }, b: { x: 5, y: 2 } })).toBe(0);
  });

  test('zero-length segment의 height는 0이다', () => {
    expect(height({ a: { x: 3, y: 3 }, b: { x: 3, y: 3 } })).toBe(0);
  });
});

describe('segment scalar property - normalAngle', () => {
  test('horizontal segment의 normalAngle은 Math.PI / 2이다', () => {
    expect(normalAngle({ a: { x: 0, y: 0 }, b: { x: 1, y: 0 } })).toBeCloseTo(Math.PI / 2);
  });

  test('vertical upward segment의 normalAngle은 Math.PI이다', () => {
    // a→b 방향이 +y (angle = π/2), normalAngle = π/2 + π/2 = π
    expect(normalAngle({ a: { x: 0, y: 0 }, b: { x: 0, y: 1 } })).toBeCloseTo(Math.PI);
  });

  test('45도 segment(+x+y)의 normalAngle은 Math.PI * 3 / 4이다', () => {
    expect(normalAngle({ a: { x: 0, y: 0 }, b: { x: 1, y: 1 } })).toBeCloseTo((Math.PI * 3) / 4);
  });

  test('zero-length segment의 normalAngle은 Math.PI / 2이다', () => {
    expect(normalAngle({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } })).toBeCloseTo(Math.PI / 2);
  });

  test('tuple endpoint segment를 지원한다', () => {
    expect(
      normalAngle([
        [0, 0],
        [1, 0],
      ])
    ).toBeCloseTo(Math.PI / 2);
  });
});
