/**
 * cubicIsLinear가 직선이면서 제어점이 현의 1/3, 2/3 위치에 있을 때만 true인지 검증한다.
 * 비율이 어긋난 직선, 비직선 곡선, 퇴화 곡선을 다룬다.
 */
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';
import { describe, expect, it } from 'vitest';
import { cubicIsLinear } from '../../../src/curve/cubic-is-linear';

describe('cubicIsLinear', () => {
  it('정확히 1/3, 2/3 위치의 직선에서 true를 반환한다', () => {
    // p1=(1,0), p2=(2,0): chord=(3,0)의 1/3, 2/3 위치
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 })).toBe(true);
  });

  it('직선이지만 비율이 맞지 않으면 false를 반환한다', () => {
    // p1=(0.5,0): 1/6 위치, p2=(1.5,0): 1/2 위치 -> false
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 0.5, y1: 0, x2: 1.5, y2: 0, x3: 3, y3: 0 })).toBe(false);
  });

  it('대각선 직선에서 true를 반환한다 (1/3, 2/3 위치)', () => {
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 })).toBe(true);
  });

  it('비직선 곡선에서 false를 반환한다', () => {
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 0, x3: 1, y3: 1 })).toBe(false);
  });

  it('degenerate: 모든 점이 동일하면 true를 반환한다', () => {
    const p = { x: 1, y: 2 };
    expect(cubicIsLinear(flatCubicFromLegacyPoints(p, p, p, p))).toBe(true);
  });

  it('degenerate: p0==p3이지만 p1, p2가 다른 점이면 false를 반환한다', () => {
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: -1, y2: 1, x3: 0, y3: 0 })).toBe(false);
  });

  it('수직 직선에서 true를 반환한다 (1/3, 2/3 위치)', () => {
    expect(cubicIsLinear({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 0, y2: 2, x3: 0, y3: 3 })).toBe(true);
  });
});
