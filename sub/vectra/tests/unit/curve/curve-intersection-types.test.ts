/**
 * curve 교차 타입 구조 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import type { CurveIntersectionOptions, IntersectionHit, IntersectionKind } from '../../../src/types';

describe('IntersectionKind / IntersectionHit / CurveIntersectionOptions 타입 구조 검증', () => {
  test('IntersectionKind는 허용 literal union을 만족한다', () => {
    const k: IntersectionKind = 'cross';
    expect(['cross', 'touch', 'overlap', 'parallel', 'coincident']).toContain(k);
  });

  test('IntersectionHit 구조가 올바른 field를 갖는다', () => {
    const hit: IntersectionHit = {
      point: { x: 1, y: 2 },
      kind: 'touch',
      tA: 0.5,
      tB: 0.3,
    };
    expect(hit.tA).toBe(0.5);
    expect(hit.tB).toBe(0.3);
    expect(hit.kind).toBe('touch');
  });

  test('CurveIntersectionOptions는 모든 field가 optional이다', () => {
    const opts: CurveIntersectionOptions = {};
    expect(opts.epsilon).toBeUndefined();
    expect(opts.epsilonT).toBeUndefined();
    expect(opts.maxDepth).toBeUndefined();
  });
});
