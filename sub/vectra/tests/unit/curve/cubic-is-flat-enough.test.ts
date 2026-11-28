/**
 * cubicIsFlatEnough가 제어점의 현 수직 거리를 flatness 임계값과 비교하는지 검증한다.
 * 직선, 약하게 휜 곡선, S자 곡선, 경계값 일치, 퇴화 곡선을 다룬다.
 */
import { describe, expect, it } from 'vitest';
import { cubicIsFlatEnough } from '../../../src/curve/cubic-is-flat-enough';
import { flatCubicFromLegacyPoints } from '../_helpers/curve-fixtures';

describe('cubicIsFlatEnough', () => {
  it('직선에서 작은 flatness에서도 true를 반환한다', () => {
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 }, 1e-10)).toBe(
      true
    );
  });

  it('편중 직선에서도 flatness 이내이면 true를 반환한다', () => {
    expect(
      cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 0.5, y1: 0, x2: 1.5, y2: 0, x3: 3, y3: 0 }, 1e-10)
    ).toBe(true);
  });

  it('약간 구부러진 곡선에서 큰 flatness에서 true를 반환한다', () => {
    // p1이 chord에서 0.1 벗어남: flatness=1.0이면 true
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0.1, x2: 2, y2: 0, x3: 3, y3: 0 }, 1.0)).toBe(
      true
    );
  });

  it('약간 구부러진 곡선에서 0 flatness에서 false를 반환한다', () => {
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0.1, x2: 2, y2: 0, x3: 3, y3: 0 }, 0.0)).toBe(
      false
    );
  });

  it('수직 거리가 flatness와 정확히 같으면 true를 반환한다', () => {
    // p1이 chord에서 수직으로 정확히 0.5 벗어남: chord=(3,0), d1=0.5
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0.5, x2: 2, y2: 0, x3: 3, y3: 0 }, 0.5)).toBe(
      true
    );
  });

  it('수직 거리가 flatness 초과이면 false를 반환한다', () => {
    // d1=0.5, flatness=0.4
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0.5, x2: 2, y2: 0, x3: 3, y3: 0 }, 0.4)).toBe(
      false
    );
  });

  it('S자 곡선에서 큰 flatness에서 true를 반환한다', () => {
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 0, x3: 1, y3: 1 }, 2.0)).toBe(
      true
    );
  });

  it('S자 곡선에서 작은 flatness에서 false를 반환한다', () => {
    expect(cubicIsFlatEnough({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 0, x3: 1, y3: 1 }, 0.01)).toBe(
      false
    );
  });

  it('degenerate: 모든 점이 동일하면 true를 반환한다', () => {
    const p = { x: 1, y: 2 };
    expect(cubicIsFlatEnough(flatCubicFromLegacyPoints(p, p, p, p), 1e-10)).toBe(true);
  });
});
