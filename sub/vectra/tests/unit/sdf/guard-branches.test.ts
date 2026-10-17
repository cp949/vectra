/**
 * inset interval signed distance 경계 테스트.
 *
 * `signedInsetIntervalDistance`는 끝점 `start + size`가 유한한 경우와 overflow하는 경우를 따로
 * 계산한다. 오른쪽 가장자리에서 inset 안쪽에 든 점, overflow 구간의 안쪽 점, inset 경계 위의 점을
 * 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { signedInsetIntervalDistance } from '../../../src/sdf/primitive.internal';

describe('signedInsetIntervalDistance — 끝점이 유한한 interval', () => {
  test('점이 오른쪽 가장자리에서 inset 안쪽에 있으면 inset에서 오른쪽 거리를 뺀 값이다', () => {
    // interval [0, 10], inset 2, point 9 → rightDistance 1
    expect(signedInsetIntervalDistance(0, 10, 2, 9)).toBe(1);
  });
});

describe('signedInsetIntervalDistance — start + size가 overflow하는 interval', () => {
  // start + size = 2^1024라 end가 Infinity가 된다. 아래 모든 점과 거리는 2의 거듭제곱 합이라 정확하다.
  const start = 2 ** 1023;
  const size = 2 ** 1023;
  const inset = 2 ** 1020;

  test('inset interval 안쪽 점은 가까운 가장자리까지 거리의 음수다', () => {
    // leftDistance 2^1021 → 왼쪽 여유 2^1020
    expect(signedInsetIntervalDistance(start, size, inset, start + 2 ** 1021)).toBe(-(2 ** 1020));
  });

  test('점이 inset interval의 왼쪽 경계 위이면 0이다', () => {
    expect(Object.is(signedInsetIntervalDistance(start, size, inset, start + inset), 0)).toBe(true);
  });

  test('점이 오른쪽 가장자리에서 inset 안쪽에 있으면 inset에서 오른쪽 거리를 뺀 값이다', () => {
    // leftDistance = 2^1023 - 2^1019 → rightDistance 2^1019
    const point = start + (2 ** 1023 - 2 ** 1019);
    expect(signedInsetIntervalDistance(start, size, inset, point)).toBe(2 ** 1019);
  });
});
