/**
 * 컴포넌트·맨해튼 측정 함수 테스트.
 * componentMin, componentMax, manhattanLength, manhattanDistance 를 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { componentMax } from '../../../src/vec/component-max';
import { componentMin } from '../../../src/vec/component-min';
import { manhattanDistance } from '../../../src/vec/manhattan-distance';
import { manhattanLength } from '../../../src/vec/manhattan-length';

describe('vec measurement - componentMin', () => {
  test('x가 작으면 x를 반환한다', () => {
    expect(componentMin({ x: 1, y: 5 })).toBe(1);
  });

  test('y가 작으면 y를 반환한다', () => {
    expect(componentMin([3, -2])).toBe(-2);
  });

  test('같으면 그 값을 반환한다', () => {
    expect(componentMin({ x: 4, y: 4 })).toBe(4);
  });

  test('음수 좌표를 올바르게 처리한다', () => {
    expect(componentMin([-3, -1])).toBe(-3);
  });

  test('tuple 입력과 object 입력이 동일한 결과를 반환한다', () => {
    expect(componentMin([2, 7])).toBe(componentMin({ x: 2, y: 7 }));
  });
});

describe('vec measurement - componentMax', () => {
  test('x가 크면 x를 반환한다', () => {
    expect(componentMax({ x: 5, y: 1 })).toBe(5);
  });

  test('y가 크면 y를 반환한다', () => {
    expect(componentMax([-2, 3])).toBe(3);
  });

  test('같으면 그 값을 반환한다', () => {
    expect(componentMax({ x: 4, y: 4 })).toBe(4);
  });

  test('음수 좌표를 올바르게 처리한다', () => {
    expect(componentMax([-3, -1])).toBe(-1);
  });

  test('tuple 입력과 object 입력이 동일한 결과를 반환한다', () => {
    expect(componentMax([2, 7])).toBe(componentMax({ x: 2, y: 7 }));
  });
});

describe('vec measurement - manhattanLength', () => {
  test('object 입력의 맨해튼 길이를 반환한다', () => {
    expect(manhattanLength({ x: 3, y: 4 })).toBe(7);
  });

  test('tuple 입력의 맨해튼 길이를 반환한다', () => {
    expect(manhattanLength([-3, 4])).toBe(7);
  });

  test('zero vector의 맨해튼 길이는 0이다', () => {
    expect(manhattanLength([0, 0])).toBe(0);
  });

  test('음수 좌표의 절댓값 합을 반환한다', () => {
    expect(manhattanLength({ x: -2, y: -5 })).toBe(7);
  });

  test('소수 좌표를 올바르게 처리한다', () => {
    expect(manhattanLength([0.5, 1.5])).toBeCloseTo(2);
  });
});

describe('vec measurement - manhattanDistance', () => {
  test('두 점 사이의 맨해튼 거리를 반환한다', () => {
    expect(manhattanDistance({ x: 0, y: 0 }, [3, 4])).toBe(7);
  });

  test('tuple 입력과 object 입력 혼합을 처리한다', () => {
    expect(manhattanDistance([1, 2], { x: 4, y: 6 })).toBe(7);
  });

  test('같은 점의 맨해튼 거리는 0이다', () => {
    expect(manhattanDistance([3, 3], { x: 3, y: 3 })).toBe(0);
  });

  test('거리는 순서에 무관하다', () => {
    const ab = manhattanDistance({ x: 1, y: 2 }, [4, 6]);
    const ba = manhattanDistance([4, 6], { x: 1, y: 2 });

    expect(ab).toBe(ba);
  });

  test('음수 좌표 사이의 거리를 올바르게 계산한다', () => {
    expect(manhattanDistance({ x: -3, y: -4 }, [0, 0])).toBe(7);
  });

  test('input object를 mutate하지 않는다', () => {
    const a = { x: 1, y: 2 };
    const b: [number, number] = [4, 6];

    manhattanDistance(a, b);

    expect(a).toEqual({ x: 1, y: 2 });
    expect(b).toEqual([4, 6]);
  });
});
