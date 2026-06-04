/**
 * cubicIsSimple unit test.
 *
 * 검증 방법:
 * - serpentine (inflection 있음): false.
 * - loop (자기교차): false.
 * - 단조 곡선 (inflection 없음, loop 아님): true.
 * - 직선: true.
 */

import { describe, expect, it } from 'vitest';
import { cubicIsSimple } from '../../../src/curve/cubic-is-simple';

describe('cubicIsSimple', () => {
  it('직선에서 true를 반환한다', () => {
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 })).toBe(true);
  });

  it('S자 곡선 (serpentine)에서 false를 반환한다 (inflection 있음)', () => {
    // inflection 1개: (0,0)-(0,1)-(1,0)-(1,1)
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe(false);
  });

  it('loop 곡선에서 false를 반환한다', () => {
    // p0=(0,0), p1=(2,2), p2=(-1,2), p3=(2,0): loop (disc<0)
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: -1, y: 2 }, { x: 2, y: 0 })).toBe(false);
  });

  it('단조 곡선에서 true를 반환한다 (inflection 없음, loop 아님)', () => {
    // 단순히 한 방향으로 휘어진 곡선
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 0 })).toBe(true);
  });

  it('낮은 볼록 단조 곡선에서 true를 반환한다', () => {
    // p1, p2가 낮게 올라온 단조 곡선: inflection 없음, loop 아님
    expect(cubicIsSimple({ x: 0, y: 0 }, { x: 1, y: 0.5 }, { x: 2, y: 0.5 }, { x: 3, y: 0 })).toBe(true);
  });

  it('cusp 경계 곡선에서 false를 반환한다 (inflection 있음)', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1,-2): disc=0, 중근 t=0.5
    expect(cubicIsSimple({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1, y: -2 })).toBe(false);
  });

  it('serpentine (2개 inflection)에서 false를 반환한다', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1.1,-2): disc>0, 2개 inflection
    expect(cubicIsSimple({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1.1, y: -2 })).toBe(false);
  });

  it('tuple XYInput을 받는다', () => {
    expect(cubicIsSimple([0, 0], [1, 2], [2, 2], [3, 0])).toBe(true);
  });
});
