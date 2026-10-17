/**
 * histogram 옵션의 런타임 타입 가드 테스트.
 *
 * 검증 항목:
 *  1. 타입 검사를 거치지 않는 JS 호출자가 숫자가 아닌 값을 넘기면 TypeError다.
 *  2. 가드마다 메시지가 달라서 정규식으로 어느 가드가 던졌는지까지 고정한다.
 *
 * 설계 메모:
 *  - TypeScript 시그니처가 막는 입력이라 `as never`로 타입을 우회한다.
 */
import { describe, expect, test } from 'vitest';
import { histogram } from '../../../src/statistics/histogram';
import { normalizeMinMax } from '../../../src/statistics/normalize-min-max';

describe('명시적 bin 경계', () => {
  test('histogram은 숫자가 아닌 bin 경계를 TypeError로 거부한다', () => {
    expect(() => histogram([1], { bins: ['a', 'b'] as never })).toThrow(
      new TypeError('options.bins[0] must be a number, got string')
    );
  });
});

describe('명시적 range', () => {
  test('histogram은 배열이 아닌 range를 TypeError로 거부한다', () => {
    expect(() => histogram([1], { range: 5 as never })).toThrow(
      new TypeError('options.range must be a readonly [number, number], got number')
    );
  });

  test('histogram은 숫자가 아닌 range 항목을 TypeError로 거부한다', () => {
    expect(() => histogram([1], { range: ['a', 'b'] as never })).toThrow(
      new TypeError('options.range entries must be number, got [string, string]')
    );
  });

  test('normalizeMinMax는 숫자가 아닌 range 항목을 TypeError로 거부한다', () => {
    expect(() => normalizeMinMax([1, 2], { range: [0, '1'] as never })).toThrow(
      new TypeError('options.range entries must be number, got [number, string]')
    );
  });
});
