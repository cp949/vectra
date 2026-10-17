/**
 * vec 각도 clamp와 할당형 `pointOnRay` 성공 경로 테스트.
 *
 * 같은 방향 벡터는 반올림으로 cos가 1을 넘고 반대 방향 벡터는 -1 아래로 내려간다. clamp 없이
 * `Math.acos`에 넘기면 NaN이 된다. `pointOnRay`는 방향이 유효하면 새 점을 돌려준다.
 */

import { describe, expect, test } from 'vitest';
import { angleBetween } from '../../../src/vec/angle-between';
import { pointOnRay } from '../../../src/vec/point-on-ray';

describe('angleBetween', () => {
  test('같은 방향이면 cos가 1을 넘어도 0을 돌려준다', () => {
    expect(angleBetween({ x: -12, y: -3 }, { x: -12, y: -3 })).toBe(0);
  });

  test('반대 방향이면 cos가 -1 아래여도 π를 돌려준다', () => {
    expect(angleBetween({ x: -12, y: -3 }, { x: 12, y: 3 })).toBe(Math.PI);
  });
});

describe('pointOnRay', () => {
  test('origin에서 정규화한 방향으로 distance만큼 이동한 새 점을 돌려준다', () => {
    expect(pointOnRay({ x: 1, y: 1 }, { x: 0, y: 5 }, 2)).toEqual({ x: 1, y: 3 });
  });
});
