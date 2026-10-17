/**
 * angle bucket 상한 경계 테스트.
 *
 * 절댓값이 아주 작은 음수 angle은 `wrapRadiansPositive`에서 `remainder + 2π`가 `2π`로 반올림되어
 * 닫힌 상한 `2π`가 된다. 이때 bucket 번호가 개수와 같아지므로 0으로 돌려야 한다.
 */

import { describe, expect, test } from 'vitest';
import { octant } from '../../../src/angle/octant';
import { quadrant } from '../../../src/angle/quadrant';

describe('bucket 상한', () => {
  test('octant는 -1e-17을 0으로 판정한다', () => {
    expect(octant(-1e-17)).toBe(0);
  });

  test('quadrant는 -1e-17을 0으로 판정한다', () => {
    expect(quadrant(-1e-17)).toBe(0);
  });
});
