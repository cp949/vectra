/** 두 직사각형이 겹치거나 닿는 경우와 빈 입력의 교차 판정을 검증한다. */
import { describe, expect, test } from 'vitest';
import { intersectsRectRect } from '../../../src/intersects/intersects-rect-rect';

describe('rect - intersectsRect (closed boundary, edge touch = true)', () => {
  test('겹치는 두 rect는 true', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 3, y: 3, width: 5, height: 5 })).toBe(true);
  });

  test('edge 전체가 접하는 경우는 true (closed boundary)', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 5, y: 0, width: 3, height: 5 })).toBe(true);
  });

  test('corner만 접하는 경우도 true (closed boundary)', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 5, y: 5, width: 3, height: 3 })).toBe(true);
  });

  test('disjoint rect는 false', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 6, y: 6, width: 3, height: 3 })).toBe(false);
  });

  test('x축 disjoint는 false', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 7, y: 0, width: 3, height: 5 })).toBe(false);
  });

  test('y축 disjoint는 false', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 5, height: 5 }, { x: 0, y: 7, width: 5, height: 3 })).toBe(false);
  });

  test('한쪽이 empty이면 false', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 0, height: 5 }, { x: 0, y: 0, width: 8, height: 8 })).toBe(false);
  });

  test('둘 다 empty이면 false', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 0, height: 5 }, { x: 0, y: 0, width: 5, height: 0 })).toBe(false);
  });

  test('포함 관계인 두 rect는 true', () => {
    expect(intersectsRectRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 2, y: 2, width: 6, height: 6 })).toBe(true);
  });
});
