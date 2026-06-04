import { describe, expect, test } from 'vitest';
import { containsRect } from '../../../src/circle/contains-rect';

describe('circle boolean query - containsRect', () => {
  test('empty rect (width=0)이면 항상 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const rect = { x: 0, y: 0, width: 0, height: 5 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('empty rect (width < 0)이면 항상 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const rect = { x: 0, y: 0, width: -1, height: 5 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('empty rect (height<0)이면 항상 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const rect = { x: 0, y: 0, width: 5, height: -1 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('empty circle + empty rect이면 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 0 };
    const rect = { x: 0, y: 0, width: 0, height: 5 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('empty circle + non-empty rect이면 false를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 0 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(containsRect(circle, rect)).toBe(false);
  });

  test('empty circle (radius < 0) + non-empty rect이면 false를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: -1 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(containsRect(circle, rect)).toBe(false);
  });

  test('empty circle (radius < 0) + empty rect이면 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: -1 };
    const rect = { x: 0, y: 0, width: 0, height: 5 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('4 corner 모두 circle 안에 있으면 true를 반환한다', () => {
    // corners at (-5,-5),(5,-5),(-5,5),(5,5), distSq=50 < r²=100
    const circle = { center: { x: 0, y: 0 }, radius: 10 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('tuple rect의 4 corner 모두 circle 안에 있으면 true를 반환한다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 10 };
    expect(containsRect(circle, [-5, -5, 10, 10])).toBe(true);
  });

  test('4 corner가 circle 경계 위에 있으면 true를 반환한다 (closed boundary)', () => {
    // corners at (-3,-4),(3,-4),(-3,4),(3,4), distSq=25 = r²=25
    const circle = { center: { x: 0, y: 0 }, radius: 5 };
    const rect = { x: -3, y: -4, width: 6, height: 8 };
    expect(containsRect(circle, rect)).toBe(true);
  });

  test('일부 corner만 circle 안에 있으면 false를 반환한다', () => {
    // corner (-3,-4) distSq=25 > r²=16 (radius=4)
    const circle = { center: { x: 0, y: 0 }, radius: 4 };
    const rect = { x: -3, y: -4, width: 6, height: 8 };
    expect(containsRect(circle, rect)).toBe(false);
  });

  test('circle이 rect 안에 있으면 false를 반환한다', () => {
    // circle too small to contain corners at (-5,-5)
    const circle = { center: { x: 0, y: 0 }, radius: 2 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(containsRect(circle, rect)).toBe(false);
  });

  test('tuple center에서도 동작한다', () => {
    const circle = { center: [0, 0] as const, radius: 10 };
    const rect = { x: -5, y: -5, width: 10, height: 10 };
    expect(containsRect(circle, rect)).toBe(true);
  });
});
