/**
 * vec.toPolar allocating companion 검증 테스트.
 *
 * 대상:
 *   - 일반 벡터의 극좌표 변환
 *   - zero-vector degenerate 처리
 *   - non-finite pass-through (NaN / Infinity / -Infinity)
 *   - toPolarInto 결과와의 동치성
 *   - companion이 새 object를 할당하는지 reference 확인
 */

import { describe, expect, test } from 'vitest';
import { toPolar } from '../../../src/vec/to-polar';
import { toPolarInto } from '../../../src/vec/to-polar-into';

describe('vec conversion - toPolar (companion)', () => {
  test('(1, 0) → r=1, theta=0을 새 object로 반환한다', () => {
    const result = toPolar({ x: 1, y: 0 });
    expect(result.r).toBeCloseTo(1, 10);
    expect(result.theta).toBeCloseTo(0, 10);
  });

  test('(0, 1) → r=1, theta=π/2를 새 object로 반환한다', () => {
    const result = toPolar({ x: 0, y: 1 });
    expect(result.r).toBeCloseTo(1, 10);
    expect(result.theta).toBeCloseTo(Math.PI / 2, 10);
  });

  test('(-1, 0) → r=1, theta=π로 정규화한다', () => {
    // toPolarInto가 -π를 π로 normalize하므로 companion도 동일 결과
    const result = toPolar({ x: -1, y: 0 });
    expect(result.r).toBeCloseTo(1, 10);
    expect(result.theta).toBe(Math.PI);
  });

  test('zero-vector → r=0, theta=0을 반환한다', () => {
    const result = toPolar({ x: 0, y: 0 });
    expect(result.r).toBe(0);
    expect(result.theta).toBe(Math.atan2(0, 0));
  });

  test('NaN x 입력은 r/theta 모두 NaN으로 pass-through한다', () => {
    // Math.hypot(NaN, 0) = NaN, Math.atan2(0, NaN) = NaN
    const result = toPolar({ x: NaN, y: 0 });
    expect(Number.isNaN(result.r)).toBe(true);
    expect(Number.isNaN(result.theta)).toBe(true);
  });

  test('Infinity x 입력은 r=Infinity, theta=0으로 pass-through한다', () => {
    // Math.hypot(Infinity, 0) = Infinity, Math.atan2(0, Infinity) = 0
    const result = toPolar({ x: Infinity, y: 0 });
    expect(result.r).toBe(Infinity);
    expect(result.theta).toBe(0);
  });

  test('-Infinity x 입력은 r=Infinity, theta=π로 pass-through한다', () => {
    // Math.hypot(-Infinity, 0) = Infinity (sign 손실), Math.atan2(0, -Infinity) = π
    // π는 -π normalize 대상이 아니므로 그대로 유지
    const result = toPolar({ x: -Infinity, y: 0 });
    expect(result.r).toBe(Infinity);
    expect(result.theta).toBe(Math.PI);
  });

  test('일반 입력에서 toPolarInto와 동일한 r/theta 값을 반환한다', () => {
    const expected = toPolarInto({ r: 0, theta: 0 }, { x: 3, y: 4 });
    const result = toPolar({ x: 3, y: 4 });
    expect(result.r).toBeCloseTo(expected.r, 12);
    expect(result.theta).toBeCloseTo(expected.theta, 12);
  });

  test('tuple 입력도 정상 처리한다', () => {
    const result = toPolar([3, 4]);
    expect(result.r).toBeCloseTo(5, 10);
    expect(result.theta).toBeCloseTo(Math.atan2(4, 3), 10);
  });

  test('호출마다 새로운 object를 할당해 반환한다', () => {
    // companion은 caller-side 새 storage를 만들어야 한다
    const a = toPolar({ x: 1, y: 0 });
    const b = toPolar({ x: 1, y: 0 });
    expect(a).not.toBe(b);
  });
});
