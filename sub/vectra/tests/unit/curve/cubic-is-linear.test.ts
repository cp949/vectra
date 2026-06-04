/**
 * cubicIsLinear unit test.
 *
 * 검증 방법:
 * - 정확히 1/3, 2/3 위치: true.
 * - 직선이지만 편중 위치: false (비율 검사 실패).
 * - 비직선: false.
 * - degenerate (모든 점 동일): true.
 * - epsilon 경계 동작.
 */

import { describe, expect, it } from 'vitest';
import { cubicIsLinear } from '../../../src/curve/cubic-is-linear';

describe('cubicIsLinear', () => {
  it('정확히 1/3, 2/3 위치의 직선에서 true를 반환한다', () => {
    // p1=(1,0), p2=(2,0): chord=(3,0)의 1/3, 2/3 위치
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 })).toBe(true);
  });

  it('직선이지만 비율이 맞지 않으면 false를 반환한다', () => {
    // p1=(0.5,0): 1/6 위치, p2=(1.5,0): 1/2 위치 -> false
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1.5, y: 0 }, { x: 3, y: 0 })).toBe(false);
  });

  it('대각선 직선에서 true를 반환한다 (1/3, 2/3 위치)', () => {
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 })).toBe(true);
  });

  it('비직선 곡선에서 false를 반환한다', () => {
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe(false);
  });

  it('degenerate: 모든 점이 동일하면 true를 반환한다', () => {
    const p = { x: 1, y: 2 };
    expect(cubicIsLinear(p, p, p, p)).toBe(true);
  });

  it('degenerate: p0==p3이지만 p1, p2가 다른 점이면 false를 반환한다', () => {
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 0, y: 0 })).toBe(false);
  });

  it('tuple XYInput을 받는다', () => {
    expect(cubicIsLinear([0, 0], [1, 0], [2, 0], [3, 0])).toBe(true);
  });

  it('수직 직선에서 true를 반환한다 (1/3, 2/3 위치)', () => {
    expect(cubicIsLinear({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 })).toBe(true);
  });
});
