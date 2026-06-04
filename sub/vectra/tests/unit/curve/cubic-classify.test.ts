/**
 * cubicClassify unit test.
 *
 * 검증 방법:
 * - 직선 (collinear): 'line'.
 * - quadratic 퇴화 (t^3 계수 0): 'quadratic'.
 * - cusp (disc ≈ 0): 'cusp'.
 * - loop (disc < 0): 'loop'.
 * - serpentine (disc > 0): 'serpentine'.
 */

import { describe, expect, it } from 'vitest';
import { cubicClassify } from '../../../src/curve/cubic-classify';

describe('cubicClassify', () => {
  it('직선을 line으로 분류한다', () => {
    // A=0, B=0, C=0: collinear
    expect(cubicClassify({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 })).toBe('line');
  });

  it('대각선 직선을 line으로 분류한다', () => {
    expect(cubicClassify({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 })).toBe('line');
  });

  it('quadratic 퇴화 곡선을 quadratic으로 분류한다', () => {
    // p0, p1, p2, p3이 quadratic 형태 (t^3 계수 0)이지만 collinear는 아님
    // p0=(0,0), p1=(1,1), p2=(2,0), p3=(3,0): b,c 계수가 있고 a=0
    // a.x = -0+3-6+3=0, a.y = -0+3-0+0=3  -> not quadratic, retry
    // 진짜 quadratic: p1 = 2/3*P1_quad, p2 = 1/3*P0+2/3*P2_quad
    // quadratic p0=(0,0), p1=(1,2), p2=(2,0) -> cubic: p0=(0,0), p1=(2/3,4/3), p2=(4/3,4/3), p3=(2,0)
    expect(cubicClassify({ x: 0, y: 0 }, { x: 2 / 3, y: 4 / 3 }, { x: 4 / 3, y: 4 / 3 }, { x: 2, y: 0 })).toBe(
      'quadratic'
    );
  });

  it('cusp 곡선을 cusp으로 분류한다', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1,-2): disc=0
    expect(cubicClassify({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1, y: -2 })).toBe('cusp');
  });

  it('loop 곡선을 loop으로 분류한다', () => {
    // p0=(0,0), p1=(2,2), p2=(-1,2), p3=(2,0): disc<0
    expect(cubicClassify({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: -1, y: 2 }, { x: 2, y: 0 })).toBe('loop');
  });

  it('S자 곡선을 serpentine으로 분류한다', () => {
    // p0=(0,0), p1=(0,1), p2=(1,0), p3=(1,1): A=0, disc>0
    expect(cubicClassify({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe('serpentine');
  });

  it('serpentine 곡선을 serpentine으로 분류한다 (A!=0, disc>0)', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1.1,-2): disc>0
    expect(cubicClassify({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1.1, y: -2 })).toBe('serpentine');
  });

  it('tuple XYInput을 받는다', () => {
    expect(cubicClassify([0, 0], [1, 0], [2, 0], [3, 0])).toBe('line');
  });
});
