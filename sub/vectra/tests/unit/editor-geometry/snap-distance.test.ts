/**
 * editor-geometry snap-distance 단위 테스트
 *
 * snapDistance 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapDistance } from '../../../src/editor-geometry/snap-distance';

describe('editor-geometry - snapDistance', () => {
  test('이미 step 배수인 distance는 변경되지 않는다', () => {
    expect(snapDistance(10, 5)).toBe(10);
  });

  test('가장 가까운 step 배수로 snap한다', () => {
    expect(snapDistance(13, 5)).toBe(15);
    expect(snapDistance(12, 5)).toBe(10);
  });

  test('0은 0으로 snap된다', () => {
    expect(snapDistance(0, 10)).toBe(0);
  });

  test('음수 distance도 올바르게 snap한다', () => {
    expect(snapDistance(-13, 5)).toBe(-15);
    expect(snapDistance(-12, 5)).toBe(-10);
  });

  test('소수 step을 처리한다', () => {
    expect(snapDistance(1.3, 0.5)).toBeCloseTo(1.5, 10);
    expect(snapDistance(1.2, 0.5)).toBeCloseTo(1.0, 10);
  });

  test('step이 0이면 NaN을 반환한다', () => {
    expect(snapDistance(5, 0)).toBeNaN();
  });
});
