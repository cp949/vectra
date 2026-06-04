/**
 * 벡터 크기·거리 측정 함수 테스트.
 * length, lengthSq, distance, distanceSq 를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { distance } from '../../../src/vec/distance';
import { distanceSq } from '../../../src/vec/distance-sq';
import { length } from '../../../src/vec/length';
import { lengthSq } from '../../../src/vec/length-sq';

describe('vec measurement - length', () => {
  test('object 입력 벡터의 길이를 반환한다', () => {
    const result = length({ x: 3, y: 4 });

    expect(result).toBe(5);
  });

  test('tuple 입력 벡터의 길이를 반환한다', () => {
    expect(length([3, 4])).toBe(5);
  });

  test('단위 벡터의 길이는 1이다', () => {
    expect(length({ x: 1, y: 0 })).toBe(1);
  });

  test('영 벡터의 길이는 0이다', () => {
    expect(length([0, 0])).toBe(0);
  });

  test('음수 좌표 벡터의 길이를 계산한다', () => {
    expect(length({ x: -3, y: -4 })).toBe(5);
  });

  test('소수 좌표 벡터의 길이를 계산한다', () => {
    expect(length([0.6, 0.8])).toBeCloseTo(1);
  });

  test('input object를 mutate하지 않는다', () => {
    const v = { x: 3, y: 4 };

    length(v);

    expect(v).toEqual({ x: 3, y: 4 });
  });
});

describe('vec measurement - lengthSq', () => {
  test('tuple 입력 벡터 길이의 제곱을 반환한다', () => {
    const result = lengthSq([3, 4]);

    expect(result).toBe(25);
  });

  test('object 입력 벡터 길이의 제곱을 반환한다', () => {
    expect(lengthSq({ x: 3, y: 4 })).toBe(25);
  });

  test('단위 벡터의 lengthSq는 1이다', () => {
    expect(lengthSq([1, 0])).toBe(1);
  });

  test('영 벡터의 lengthSq는 0이다', () => {
    expect(lengthSq({ x: 0, y: 0 })).toBe(0);
  });

  test('음수 좌표 벡터의 lengthSq를 계산한다', () => {
    expect(lengthSq([-3, -4])).toBe(25);
  });

  test('소수 좌표 벡터의 lengthSq를 계산한다', () => {
    expect(lengthSq([0.5, 0.5])).toBeCloseTo(0.5);
  });

  test('input object를 mutate하지 않는다', () => {
    const v: [number, number] = [3, 4];

    lengthSq(v);

    expect(v).toEqual([3, 4]);
  });
});

describe('vec measurement - distance', () => {
  test('object 입력과 tuple 입력 사이의 거리를 반환한다', () => {
    // a는 object, b는 tuple - 혼합 입력 검증
    const result = distance({ x: 1, y: 2 }, [4, 6]);

    expect(result).toBe(5);
  });

  test('같은 점 사이의 거리는 0이다', () => {
    expect(distance({ x: 3, y: 3 }, [3, 3])).toBe(0);
  });

  test('거리는 순서에 무관하다', () => {
    const ab = distance({ x: 1, y: 2 }, [4, 6]);
    const ba = distance([4, 6], { x: 1, y: 2 });

    expect(ab).toBe(ba);
  });

  test('음수 좌표 사이의 거리를 계산한다', () => {
    expect(distance({ x: -3, y: -4 }, [0, 0])).toBe(5);
  });

  test('소수 좌표 사이의 거리를 계산한다', () => {
    expect(distance([0, 0], { x: 0.3, y: 0.4 })).toBeCloseTo(0.5);
  });

  test('input object를 mutate하지 않는다', () => {
    const a = { x: 1, y: 2 };
    const b: [number, number] = [4, 6];

    distance(a, b);

    expect(a).toEqual({ x: 1, y: 2 });
    expect(b).toEqual([4, 6]);
  });
});

describe('vec measurement - distanceSq', () => {
  test('tuple 입력과 object 입력 사이 거리의 제곱을 반환한다', () => {
    // a는 tuple, b는 object - 혼합 입력 검증
    const result = distanceSq([-1, -2], { x: 2, y: 2 });

    expect(result).toBe(25);
  });

  test('같은 점 사이의 distanceSq는 0이다', () => {
    expect(distanceSq([5, 5], { x: 5, y: 5 })).toBe(0);
  });

  test('distanceSq는 순서에 무관하다', () => {
    const ab = distanceSq({ x: 1, y: 2 }, [4, 6]);
    const ba = distanceSq([4, 6], { x: 1, y: 2 });

    expect(ab).toBe(ba);
  });

  test('음수 좌표 사이의 distanceSq를 계산한다', () => {
    expect(distanceSq([-3, -4], { x: 0, y: 0 })).toBe(25);
  });

  test('소수 좌표 사이의 distanceSq를 계산한다', () => {
    expect(distanceSq([0, 0], { x: 0.3, y: 0.4 })).toBeCloseTo(0.25);
  });

  test('input object를 mutate하지 않는다', () => {
    const a: [number, number] = [-1, -2];
    const b = { x: 2, y: 2 };

    distanceSq(a, b);

    expect(a).toEqual([-1, -2]);
    expect(b).toEqual({ x: 2, y: 2 });
  });
});
