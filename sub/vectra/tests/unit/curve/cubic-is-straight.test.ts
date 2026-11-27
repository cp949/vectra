import { flatCubicFromLegacyPoints } from '../../../src/internal/legacy-curve.internal';
/**
 * cubicIsStraight unit test.
 *
 * 검증 방법:
 * - 수직 거리 0인 직선: true (비율 무관).
 * - 미세하게 구부러진 곡선: false.
 * - degenerate (p0 == p3): 같은 점이면 true, 다른 점이면 false.
 * - epsilon 경계 동작.
 */

import { describe, expect, it } from 'vitest';
import { cubicIsStraight } from '../../../src/curve/cubic-is-straight';

describe('cubicIsStraight', () => {
  it('수직 거리 0인 직선에서 true를 반환한다 (편중 위치 포함)', () => {
    // 1/3, 2/3 비율이 아니어도 chord 위에 있으면 true
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 0.5, y1: 0, x2: 1.5, y2: 0, x3: 3, y3: 0 })).toBe(true);
  });

  it('정확히 1/3, 2/3 직선에서 true를 반환한다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0, x2: 2, y2: 0, x3: 3, y3: 0 })).toBe(true);
  });

  it('대각선 직선에서 true를 반환한다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: 2, y2: 2, x3: 3, y3: 3 })).toBe(true);
  });

  it('미세하게 구부러진 곡선에서 false를 반환한다', () => {
    // p1이 chord에서 수직으로 0.1 떨어져 있음
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 0.1, x2: 2, y2: 0, x3: 3, y3: 0 })).toBe(false);
  });

  it('비직선 곡선에서 false를 반환한다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 1, x2: 1, y2: 0, x3: 1, y3: 1 })).toBe(false);
  });

  it('degenerate: 모든 점이 동일하면 true를 반환한다', () => {
    const p = { x: 1, y: 2 };
    expect(cubicIsStraight(flatCubicFromLegacyPoints(p, p, p, p))).toBe(true);
  });

  it('degenerate: p0==p3이지만 p1, p2가 다른 점이면 false를 반환한다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: 1, x2: -1, y2: 1, x3: 0, y3: 0 })).toBe(false);
  });

  it('수직 직선에서 true를 반환한다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 0, y1: 0.5, x2: 0, y2: 1.5, x3: 0, y3: 3 })).toBe(true);
  });

  it('epsilon 경계에서 올바르게 동작한다', () => {
    const eps = 1e-10;
    // p1이 epsilon 이하 거리: true
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: eps * 0.5, x2: 2, y2: 0, x3: 3, y3: 0 })).toBe(
      true
    );
    // p1이 epsilon 초과 거리: false
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 1, y1: eps * 10, x2: 2, y2: 0, x3: 3, y3: 0 })).toBe(
      false
    );
  });

  it('tuple XYInput을 받는다', () => {
    expect(cubicIsStraight({ kind: 'cubic', x0: 0, y0: 0, x1: 0.5, y1: 0, x2: 1.5, y2: 0, x3: 3, y3: 0 })).toBe(true);
  });
});
