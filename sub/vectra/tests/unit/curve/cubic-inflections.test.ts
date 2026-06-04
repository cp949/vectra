/**
 * cubicInflections unit test.
 *
 * 검증 방법:
 * - 직선: inflection 없음 (0개).
 * - S자 곡선 (A=0 linear equation): (0,1) 내 근 1개.
 * - cusp 경계 (disc=0): 중근 1개.
 * - 진짜 serpentine (A!=0, disc>0): (0,1) 내 근 2개.
 * - loop (disc<0): inflection 없음.
 * - 결과는 항상 오름차순으로 정렬된다.
 */

import { describe, expect, it } from 'vitest';
import { cubicInflections } from '../../../src/curve/cubic-inflections';

describe('cubicInflections', () => {
  it('직선에서 inflection이 없다', () => {
    const result = cubicInflections({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 });
    expect(result).toHaveLength(0);
  });

  it('S자 곡선에서 inflection이 1개다 (A=0 linear)', () => {
    // p0=(0,0), p1=(0,1), p2=(1,0), p3=(1,1): A=0, linear equation -> t=0.5
    const result = cubicInflections({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(0.5, 10);
  });

  it('cusp 경계 곡선에서 inflection이 1개다 (중근)', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1,-2): disc=0, 중근 t=0.5
    const result = cubicInflections({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1, y: -2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(0.5, 10);
  });

  it('serpentine 곡선에서 inflection이 2개다 (A!=0, disc>0)', () => {
    // p0=(-1,-2), p1=(1,2), p2=(-1,2), p3=(1.1,-2): disc>0, t1≈0.444, t2≈0.556
    const result = cubicInflections({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1.1, y: -2 });
    expect(result).toHaveLength(2);
    expect(result[0]).toBeCloseTo(4 / 9, 8);
    expect(result[1]).toBeCloseTo(5 / 9, 8);
  });

  it('loop 곡선에서 inflection이 없다 (disc<0)', () => {
    // p0=(0,0), p1=(2,2), p2=(-1,2), p3=(2,0): disc<0
    const result = cubicInflections({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: -1, y: 2 }, { x: 2, y: 0 });
    expect(result).toHaveLength(0);
  });

  it('결과가 오름차순으로 정렬된다', () => {
    const result = cubicInflections({ x: -1, y: -2 }, { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1.1, y: -2 });
    expect(result).toHaveLength(2);
    expect(result[0]).toBeLessThan(result[1]);
  });

  it('tuple XYInput을 받는다', () => {
    const result = cubicInflections([0, 0], [0, 1], [1, 0], [1, 1]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeCloseTo(0.5, 10);
  });
});
