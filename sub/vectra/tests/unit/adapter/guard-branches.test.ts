/**
 * adapter 직렬화의 유한하지 않은 좌표 처리 테스트.
 *
 * NaN과 Infinity 좌표는 빈 문자열로 치환되어 연속 공백이 생긴다. 입력 유효성은 caller 책임이다.
 */

import { describe, expect, test } from 'vitest';
import { pointsToString } from '../../../src/adapter/points-to-string';

describe('pointsToString — 유한하지 않은 좌표', () => {
  test('NaN과 Infinity 좌표는 빈 문자열이 되어 공백만 남는다', () => {
    expect(pointsToString([{ x: Number.NaN, y: 1 }])).toBe(' 1');
    expect(pointsToString([{ x: 2, y: Number.POSITIVE_INFINITY }])).toBe('2 ');
  });

  test('precision을 줘도 유한하지 않은 좌표는 빈 문자열이다', () => {
    expect(pointsToString([{ x: Number.NEGATIVE_INFINITY, y: 1.5 }], { precision: 2 })).toBe(' 1.5');
  });
});
