/**
 * 벡터 각도 측정 함수 테스트.
 * angle(벡터 방위각), angleBetween(두 벡터 사잇각), directedAngle(부호 있는 사잇각) 을 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { angle } from '../../../src/vec/angle';
import { angleBetween } from '../../../src/vec/angle-between';
import { directedAngle } from '../../../src/vec/directed-angle';

describe('vec measurement - angle', () => {
  test('양의 x축 방향은 0을 반환한다', () => {
    expect(angle({ x: 1, y: 0 })).toBe(0);
  });

  test('양의 y축 방향은 π/2를 반환한다', () => {
    expect(angle({ x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  test('음의 x축 방향은 π를 반환한다', () => {
    expect(angle({ x: -1, y: 0 })).toBeCloseTo(Math.PI);
  });

  test('음의 y축 방향은 -π/2를 반환한다', () => {
    expect(angle({ x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2);
  });

  test('대각선 방향은 π/4를 반환한다', () => {
    expect(angle({ x: 1, y: 1 })).toBeCloseTo(Math.PI / 4);
  });

  test('zero vector는 0을 반환한다', () => {
    expect(angle({ x: 0, y: 0 })).toBe(0);
  });
});

describe('vec measurement - angleBetween', () => {
  test('같은 방향 벡터의 사잇각은 0이다', () => {
    expect(angleBetween({ x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(0);
  });

  test('수직 벡터의 사잇각은 π/2이다', () => {
    expect(angleBetween({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  test('반대 방향 벡터의 사잇각은 π이다', () => {
    expect(angleBetween({ x: 1, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
  });

  test('대각선 벡터의 사잇각은 π/4이다', () => {
    expect(angleBetween({ x: 1, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.PI / 4);
  });

  test('zero vector a는 0을 반환한다', () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });

  test('zero vector b는 0을 반환한다', () => {
    expect(angleBetween({ x: 1, y: 0 }, { x: 0, y: 0 })).toBe(0);
  });

  test('사잇각은 순서에 무관하다', () => {
    const ab = angleBetween({ x: 1, y: 2 }, { x: 3, y: 4 });
    const ba = angleBetween({ x: 3, y: 4 }, { x: 1, y: 2 });

    expect(ab).toBeCloseTo(ba);
  });
});

describe('vec measurement - directedAngle', () => {
  test('같은 방향이면 0을 반환한다', () => {
    expect(directedAngle({ x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(0);
  });

  test('CCW 90도 회전은 양수 π/2를 반환한다', () => {
    expect(directedAngle({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  test('CW 90도 회전은 음수 -π/2를 반환한다', () => {
    expect(directedAngle({ x: 1, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2);
  });

  test('반대 방향은 ±π를 반환한다', () => {
    const result = directedAngle({ x: 1, y: 0 }, { x: -1, y: 0 });

    expect(Math.abs(result)).toBeCloseTo(Math.PI);
  });

  test('zero vector a는 0을 반환한다', () => {
    expect(directedAngle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });

  test('zero vector b는 0을 반환한다', () => {
    expect(directedAngle({ x: 1, y: 0 }, { x: 0, y: 0 })).toBe(0);
  });

  test('부호가 방향에 따라 반전된다', () => {
    const ab = directedAngle({ x: 1, y: 0 }, { x: 1, y: 1 });
    const ba = directedAngle({ x: 1, y: 1 }, { x: 1, y: 0 });

    expect(ab).toBeCloseTo(-ba);
  });
});
