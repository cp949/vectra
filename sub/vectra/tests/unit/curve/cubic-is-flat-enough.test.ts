/**
 * cubicIsFlatEnough unit test.
 *
 * 검증 방법:
 * - 직선: 작은 flatness에서 true.
 * - 약간 구부러진 곡선: 큰 flatness에서 true, 0에서 false.
 * - degenerate (p0 == p3).
 * - flatness가 수직 거리 임계값임을 확인.
 */

import { describe, expect, it } from 'vitest';
import { cubicIsFlatEnough } from '../../../src/curve/cubic-is-flat-enough';

describe('cubicIsFlatEnough', () => {
  it('직선에서 작은 flatness에서도 true를 반환한다', () => {
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, 1e-10)).toBe(true);
  });

  it('편중 직선에서도 flatness 이내이면 true를 반환한다', () => {
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1.5, y: 0 }, { x: 3, y: 0 }, 1e-10)).toBe(true);
  });

  it('약간 구부러진 곡선에서 큰 flatness에서 true를 반환한다', () => {
    // p1이 chord에서 0.1 벗어남: flatness=1.0이면 true
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 1, y: 0.1 }, { x: 2, y: 0 }, { x: 3, y: 0 }, 1.0)).toBe(true);
  });

  it('약간 구부러진 곡선에서 0 flatness에서 false를 반환한다', () => {
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 1, y: 0.1 }, { x: 2, y: 0 }, { x: 3, y: 0 }, 0.0)).toBe(false);
  });

  it('수직 거리가 flatness와 정확히 같으면 true를 반환한다', () => {
    // p1이 chord에서 수직으로 정확히 0.5 벗어남: chord=(3,0), d1=0.5
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 1, y: 0.5 }, { x: 2, y: 0 }, { x: 3, y: 0 }, 0.5)).toBe(true);
  });

  it('수직 거리가 flatness 초과이면 false를 반환한다', () => {
    // d1=0.5, flatness=0.4
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 1, y: 0.5 }, { x: 2, y: 0 }, { x: 3, y: 0 }, 0.4)).toBe(false);
  });

  it('S자 곡선에서 큰 flatness에서 true를 반환한다', () => {
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, 2.0)).toBe(true);
  });

  it('S자 곡선에서 작은 flatness에서 false를 반환한다', () => {
    expect(cubicIsFlatEnough({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, 0.01)).toBe(false);
  });

  it('degenerate: 모든 점이 동일하면 true를 반환한다', () => {
    const p = { x: 1, y: 2 };
    expect(cubicIsFlatEnough(p, p, p, p, 1e-10)).toBe(true);
  });

  it('tuple XYInput을 받는다', () => {
    expect(cubicIsFlatEnough([0, 0], [1, 0], [2, 0], [3, 0], 1e-10)).toBe(true);
  });
});
