/**
 * 벡터 곱 측정 함수 테스트.
 * dot(내적), cross(2D 외적 스칼라), cross3(삼점 외적), orientation(방향) 을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { cross } from '../../../src/vec/cross';
import { cross3 } from '../../../src/vec/cross3';
import { dot } from '../../../src/vec/dot';
import { orientation } from '../../../src/vec/orientation';

describe('vec measurement - dot', () => {
  test('object 입력과 tuple 입력의 내적을 반환한다', () => {
    // a는 object, b는 tuple - 혼합 입력 검증
    const result = dot({ x: 2, y: 3 }, [4, -5]);

    expect(result).toBe(-7);
  });

  test('같은 방향 벡터의 내적은 양수다', () => {
    expect(dot([1, 0], { x: 1, y: 0 })).toBe(1);
  });

  test('수직 벡터의 내적은 0이다', () => {
    expect(dot({ x: 1, y: 0 }, [0, 1])).toBe(0);
  });

  test('음수 좌표를 포함한 내적을 계산한다', () => {
    expect(dot([-2, -3], { x: 4, y: 5 })).toBe(-23);
  });

  test('소수 좌표를 포함한 내적을 계산한다', () => {
    expect(dot([0.5, 1.5], { x: 2, y: 4 })).toBeCloseTo(7);
  });

  test('input object를 mutate하지 않는다', () => {
    const a = { x: 2, y: 3 };
    const b: [number, number] = [4, -5];

    dot(a, b);

    expect(a).toEqual({ x: 2, y: 3 });
    expect(b).toEqual([4, -5]);
  });
});

describe('vec measurement - cross', () => {
  test('tuple 입력과 object 입력의 외적(z 스칼라)을 반환한다', () => {
    // a는 tuple, b는 object - 혼합 입력 검증
    const result = cross([2, 3], { x: 4, y: 5 });

    expect(result).toBe(-2);
  });

  test('같은 방향 벡터의 외적은 0이다', () => {
    expect(cross([1, 0], { x: 2, y: 0 })).toBe(0);
  });

  test('순서를 바꾸면 부호가 반전된다', () => {
    const ab = cross([1, 2], { x: 3, y: 4 });
    const ba = cross({ x: 3, y: 4 }, [1, 2]);

    expect(ab).toBe(-ba);
  });

  test('음수 좌표를 포함한 외적을 계산한다', () => {
    expect(cross([-1, 2], { x: 3, y: -4 })).toBe(4 - 6);
  });

  test('소수 좌표를 포함한 외적을 계산한다', () => {
    expect(cross([0.5, 1.5], { x: 2, y: 4 })).toBeCloseTo(0.5 * 4 - 1.5 * 2);
  });

  test('input object를 mutate하지 않는다', () => {
    const a: [number, number] = [2, 3];
    const b = { x: 4, y: 5 };

    cross(a, b);

    expect(a).toEqual([2, 3]);
    expect(b).toEqual({ x: 4, y: 5 });
  });
});

describe('vec measurement - orientation', () => {
  test('CCW 순서의 점은 양수를 반환한다', () => {
    // a=(0,0), b=(1,0), c=(0,1) → CCW
    expect(orientation([0, 0], [1, 0], { x: 0, y: 1 })).toBeGreaterThan(0);
  });

  test('CW 순서의 점은 음수를 반환한다', () => {
    // a=(0,0), b=(0,1), c=(1,0) → CW
    expect(orientation({ x: 0, y: 0 }, [0, 1], [1, 0])).toBeLessThan(0);
  });

  test('일직선의 점은 0을 반환한다', () => {
    expect(orientation([0, 0], [1, 1], { x: 2, y: 2 })).toBe(0);
  });

  test('세 점이 같으면 0을 반환한다', () => {
    expect(orientation([1, 1], [1, 1], { x: 1, y: 1 })).toBe(0);
  });

  test('object 입력과 tuple 입력 혼합을 처리한다', () => {
    const result = orientation({ x: 0, y: 0 }, [2, 0], { x: 1, y: 1 });

    expect(result).toBeGreaterThan(0);
  });
});

describe('vec measurement - cross3', () => {
  test('orientation과 동일한 결과를 반환한다', () => {
    const a = { x: 0, y: 0 };
    const b: [number, number] = [1, 0];
    const c = { x: 0, y: 1 };

    expect(cross3(a, b, c)).toBe(orientation(a, b, c));
  });

  test('삼각형의 signed area는 cross3 / 2이다', () => {
    // (0,0), (4,0), (0,3) → 면적 = 6
    const result = cross3([0, 0], { x: 4, y: 0 }, [0, 3]);

    expect(result / 2).toBeCloseTo(6);
  });

  test('CW 삼각형은 음수를 반환한다', () => {
    expect(cross3([0, 0], [0, 1], { x: 1, y: 0 })).toBeLessThan(0);
  });

  test('일직선은 0을 반환한다', () => {
    expect(cross3({ x: 0, y: 0 }, [1, 1], [2, 2])).toBe(0);
  });
});
