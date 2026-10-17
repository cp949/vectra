/**
 * motion `timeToDisplacement`의 초기 속도 0과 해 없음 경계 테스트.
 *
 * 초기 속도가 0이면 cancellation이 없어 판별식 제곱근을 가속도로 나눈 값을 쓴다. 두 해가 모두
 * 음수이면 미래에 도달하지 않으므로 `undefined`를 돌려준다.
 */

import { describe, expect, test } from 'vitest';
import { timeToDisplacement } from '../../../src/motion/time-to-displacement';

describe('timeToDisplacement', () => {
  test('초기 속도가 0이면 sqrt(2d / a)를 돌려준다', () => {
    // 0.5 * 2 * t^2 = 4 → t = 2
    expect(timeToDisplacement(0, 2, 4)).toBeCloseTo(2, 12);
  });

  test('초기 속도가 0이고 가속도가 음수여도 양수 시간을 돌려준다', () => {
    expect(timeToDisplacement(0, -2, -4)).toBeCloseTo(2, 12);
  });

  test('두 해가 모두 음수이면 undefined를 돌려준다', () => {
    // 0.5t^2 + t + 0.3 = 0 → t = -1 ± sqrt(0.4), 둘 다 음수
    expect(timeToDisplacement(1, 1, -0.3)).toBeUndefined();
  });
});
