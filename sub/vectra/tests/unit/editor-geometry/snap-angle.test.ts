/**
 * editor-geometry snap-angle 단위 테스트
 *
 * snapAngle 동작을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { snapAngle } from '../../../src/editor-geometry/snap-angle';

describe('editor-geometry - snapAngle', () => {
  test('이미 step 배수인 angle은 변경되지 않는다', () => {
    const step = Math.PI / 4;
    expect(snapAngle(step, step)).toBeCloseTo(step, 10);
  });

  test('가장 가까운 step 배수로 snap한다', () => {
    const step = Math.PI / 4;
    // Math.PI / 4 * 1.4 → 1.4 step → round to 1 step
    const angle = step * 1.4;
    expect(snapAngle(angle, step)).toBeCloseTo(step, 10);
  });

  test('0도 snap을 올바르게 처리한다', () => {
    const step = Math.PI / 6;
    expect(snapAngle(0, step)).toBeCloseTo(0, 10);
  });

  test('음수 angle을 올바르게 처리한다', () => {
    const step = Math.PI / 4;
    expect(snapAngle(-step * 0.6, step)).toBeCloseTo(-step, 10);
  });

  test('2π 부근 angle을 올바르게 snap한다', () => {
    const step = Math.PI / 4;
    const angle = Math.PI * 2 - step * 0.3;
    expect(snapAngle(angle, step)).toBeCloseTo(Math.PI * 2, 10);
  });

  test('45도 step으로 90도를 snap한다', () => {
    const step = Math.PI / 4;
    expect(snapAngle(Math.PI / 2, step)).toBeCloseTo(Math.PI / 2, 10);
  });

  test('step이 0이면 NaN을 반환한다', () => {
    expect(snapAngle(1.0, 0)).toBeNaN();
  });
});
