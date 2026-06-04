/**
 * infinite-line distance 단위 테스트.
 *
 * distanceToPointSq, distanceToPoint의 unclamped 수선의 발 거리 정책과
 * non-normalized direction 처리, degenerate 입력 거동을 함께 다룬다.
 */
import { describe, expect, test } from 'vitest';
import { distanceToPoint } from '../../../src/infinite-line/distance-to-point';
import { distanceToPointSq } from '../../../src/infinite-line/distance-to-point-sq';

describe('infinite-line distance - distanceToPointSq', () => {
  test('infinite-line 위 point의 distance squared는 0이다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPointSq(line, { x: 2, y: 0 })).toBe(0);
  });

  test('수직 offset 거리 제곱을 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPointSq(line, { x: 2, y: 3 })).toBe(9);
  });

  test('segment과 달리 t < 0에서도 수선의 발 거리이다 (unclamped)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    // point=(-2, 3)의 수선의 발은 (-2, 0). 거리 제곱 = 9
    expect(distanceToPointSq(line, { x: -2, y: 3 })).toBe(9);
  });

  test('segment과 달리 t > 1에서도 수선의 발 거리이다 (unclamped)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    // point=(10, 3)의 수선의 발은 (10, 0). 거리 제곱 = 9
    expect(distanceToPointSq(line, { x: 10, y: 3 })).toBe(9);
  });

  test('non-normalized direction에서도 정확한 거리 제곱을 반환한다', () => {
    // direction=(3,4) (length=5), point=(3,0): foot ≈ (1.08, 1.44), dist² ≈ 5.76
    const line = { origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } };
    expect(distanceToPointSq(line, { x: 3, y: 0 })).toBeCloseTo(5.76, 10);
  });

  test('degenerate infinite-line은 origin-point 거리 제곱을 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(distanceToPointSq(line, { x: 3, y: 4 })).toBe(25);
  });
});

describe('infinite-line distance - distanceToPoint', () => {
  test('infinite-line 위 point의 distance는 0이다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPoint(line, { x: 2, y: 0 })).toBe(0);
  });

  test('수직 offset 거리를 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPoint(line, { x: 2, y: 3 })).toBe(3);
  });

  test('t < 0에서도 수선의 발 거리이다 (unclamped)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPoint(line, { x: -2, y: 3 })).toBe(3);
  });

  test('t > 1에서도 수선의 발 거리이다 (unclamped)', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 4, y: 0 } };
    expect(distanceToPoint(line, { x: 10, y: 3 })).toBe(3);
  });

  test('3-4-5 비율 segment projection 거리를 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 3, y: 4 } };
    expect(distanceToPoint(line, { x: 3, y: 0 })).toBeCloseTo(2.4, 10);
  });

  test('degenerate infinite-line은 origin-point 거리를 반환한다', () => {
    const line = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };
    expect(distanceToPoint(line, { x: 3, y: 4 })).toBe(5);
  });
});
