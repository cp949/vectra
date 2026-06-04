import { describe, expect, test } from 'vitest';
import { distanceToCircle } from '../../../src/circle/distance-to-circle';

describe('distanceToCircle', () => {
  describe('분리', () => {
    test('두 circle이 완전히 분리되면 두 center 거리에서 반지름 합을 뺀 값을 반환한다', () => {
      // center dist = 10, r1+r2 = 4, d = 6
      const a = { center: { x: 0, y: 0 }, radius: 2 };
      const b = { center: { x: 10, y: 0 }, radius: 2 };
      expect(distanceToCircle(a, b)).toBe(6);
    });

    test('대각선 방향으로 분리된 경우에도 올바른 거리를 반환한다', () => {
      // center dist = 5(3-4-5), r1+r2=1+1=2, d=3
      const a = { center: { x: 0, y: 0 }, radius: 1 };
      const b = { center: { x: 3, y: 4 }, radius: 1 };
      expect(distanceToCircle(a, b)).toBe(3);
    });
  });

  describe('외접 접촉', () => {
    test('외접 tangent (center dist = r1+r2)이면 0을 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 2 };
      const b = { center: { x: 4, y: 0 }, radius: 2 };
      expect(distanceToCircle(a, b)).toBe(0);
    });
  });

  describe('overlap', () => {
    test('두 circle이 교차하면 0을 반환한다', () => {
      // center dist = 4, r1+r2 = 6, d = -2 → clamped 0
      const a = { center: { x: 0, y: 0 }, radius: 3 };
      const b = { center: { x: 4, y: 0 }, radius: 3 };
      expect(distanceToCircle(a, b)).toBe(0);
    });

    test('한 circle이 다른 circle을 완전히 포함하면 0을 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 10 };
      const b = { center: { x: 1, y: 0 }, radius: 2 };
      expect(distanceToCircle(a, b)).toBe(0);
    });

    test('동심원이면 0을 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 3 };
      const b = { center: { x: 0, y: 0 }, radius: 5 };
      expect(distanceToCircle(a, b)).toBe(0);
    });
  });

  describe('empty circle 처리 (center point로 취급)', () => {
    test('a가 empty circle (radius=0)이면 center point로 취급한다', () => {
      // a = point (0,0), b center = (5,0), rb = 2 → d = 5 - 2 = 3
      const a = { center: { x: 0, y: 0 }, radius: 0 };
      const b = { center: { x: 5, y: 0 }, radius: 2 };
      expect(distanceToCircle(a, b)).toBe(3);
    });

    test('b가 empty circle (radius<0)이면 center point로 취급한다', () => {
      // a center=(0,0) ra=2, b=point(5,0) → d = 5 - 2 = 3
      const a = { center: { x: 0, y: 0 }, radius: 2 };
      const b = { center: { x: 5, y: 0 }, radius: -1 };
      expect(distanceToCircle(a, b)).toBe(3);
    });

    test('두 circle 모두 empty이면 center 간 거리를 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 0 };
      const b = { center: { x: 3, y: 4 }, radius: 0 };
      expect(distanceToCircle(a, b)).toBe(5);
    });

    test('두 circle 모두 empty이고 동일 center이면 0을 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 0 };
      const b = { center: { x: 0, y: 0 }, radius: 0 };
      expect(distanceToCircle(a, b)).toBe(0);
    });

    test('a가 empty, b도 point에 닿아 있으면 0을 반환한다', () => {
      // a = point (0,0), b center = (2,0), rb=0 → d = 2 → > 0
      // 하지만 완전히 분리: d = 2 - 0 - 0 = 2
      const a = { center: { x: 0, y: 0 }, radius: 0 };
      const b = { center: { x: 2, y: 0 }, radius: 0 };
      expect(distanceToCircle(a, b)).toBe(2);
    });
  });

  describe('대칭성', () => {
    test('a와 b를 바꿔도 같은 거리를 반환한다', () => {
      const a = { center: { x: 0, y: 0 }, radius: 2 };
      const b = { center: { x: 10, y: 0 }, radius: 3 };
      expect(distanceToCircle(a, b)).toBe(distanceToCircle(b, a));
    });
  });

  describe('input forms', () => {
    test('tuple center에서도 동작한다', () => {
      const a = { center: [0, 0] as const, radius: 2 };
      const b = { center: [10, 0] as const, radius: 2 };
      expect(distanceToCircle(a, b)).toBe(6);
    });

    test('tuple shorthand CircleLike에서도 동작한다', () => {
      const a = [[0, 0], 2] as const;
      const b = [[10, 0], 2] as const;
      expect(distanceToCircle(a, b)).toBe(6);
    });
  });
});
