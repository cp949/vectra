/**
 * internal iteration-options 단위 테스트.
 *
 * resolveIterationOptions가 세 필드의 default 채우기, 값 검증, 검증 순서, 오류 메시지를 지키는지 검증한다.
 */

import { describe, expect, test } from 'vitest';
import {
  DEFAULT_ITERATION_EPSILON,
  DEFAULT_ITERATION_MAX,
  DEFAULT_ITERATION_TOLERANCE,
  DEFAULT_JACOBI_SWEEPS,
  defaultJacobiMaxIterations,
  resolveIterationOptions,
} from '../../../src/internal/iteration-options';

describe('internal iteration-options — resolveIterationOptions', () => {
  test('default 상수는 100, 1e-10, 1e-9다', () => {
    expect(DEFAULT_ITERATION_MAX).toBe(100);
    expect(DEFAULT_ITERATION_TOLERANCE).toBe(1e-10);
    expect(DEFAULT_ITERATION_EPSILON).toBe(1e-9);
  });

  test('undefined options는 tolerance와 epsilon default를 채우고 maxIterations는 비워 둔다', () => {
    expect(resolveIterationOptions(undefined, 'options')).toEqual({
      maxIterations: undefined,
      tolerance: DEFAULT_ITERATION_TOLERANCE,
      epsilon: DEFAULT_ITERATION_EPSILON,
    });
  });

  test('빈 options도 maxIterations는 비워 둔다', () => {
    expect(resolveIterationOptions({}, 'options')).toEqual({
      maxIterations: undefined,
      tolerance: DEFAULT_ITERATION_TOLERANCE,
      epsilon: DEFAULT_ITERATION_EPSILON,
    });
  });

  test('지정한 필드는 그대로 쓰고 나머지는 default를 쓴다', () => {
    expect(resolveIterationOptions({ maxIterations: 7 }, 'options')).toEqual({
      maxIterations: 7,
      tolerance: DEFAULT_ITERATION_TOLERANCE,
      epsilon: DEFAULT_ITERATION_EPSILON,
    });
    expect(resolveIterationOptions({ tolerance: 0.5 }, 'options')).toEqual({
      maxIterations: undefined,
      tolerance: 0.5,
      epsilon: DEFAULT_ITERATION_EPSILON,
    });
    expect(resolveIterationOptions({ epsilon: 0.25 }, 'options')).toEqual({
      maxIterations: undefined,
      tolerance: DEFAULT_ITERATION_TOLERANCE,
      epsilon: 0.25,
    });
  });

  test('maxIterations는 positive safe integer만 허용한다', () => {
    expect(resolveIterationOptions({ maxIterations: 1 }, 'options').maxIterations).toBe(1);
    expect(resolveIterationOptions({ maxIterations: Number.MAX_SAFE_INTEGER }, 'options').maxIterations).toBe(
      Number.MAX_SAFE_INTEGER
    );
    for (const bad of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, '5', null]) {
      expect(() => resolveIterationOptions({ maxIterations: bad as never }, 'options')).toThrow(
        new RangeError(`options.maxIterations must be a positive safe integer, got ${String(bad)}`)
      );
    }
  });

  test('tolerance는 0 이상 finite number만 허용한다', () => {
    expect(resolveIterationOptions({ tolerance: 0 }, 'options').tolerance).toBe(0);
    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '1e-3', null]) {
      expect(() => resolveIterationOptions({ tolerance: bad as never }, 'options')).toThrow(
        new RangeError(`options.tolerance must be a finite number >= 0, got ${String(bad)}`)
      );
    }
  });

  test('epsilon은 0 이상 finite number만 허용한다', () => {
    expect(resolveIterationOptions({ epsilon: 0 }, 'options').epsilon).toBe(0);
    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '1e-3', null]) {
      expect(() => resolveIterationOptions({ epsilon: bad as never }, 'options')).toThrow(
        new RangeError(`options.epsilon must be a finite number >= 0, got ${String(bad)}`)
      );
    }
  });

  test('오류 메시지는 name 인자를 접두사로 쓴다', () => {
    expect(() => resolveIterationOptions({ maxIterations: 0 }, 'opts')).toThrow(
      'opts.maxIterations must be a positive safe integer, got 0'
    );
    expect(() => resolveIterationOptions({ tolerance: -1 }, 'opts')).toThrow(
      'opts.tolerance must be a finite number >= 0, got -1'
    );
    expect(() => resolveIterationOptions({ epsilon: -1 }, 'opts')).toThrow(
      'opts.epsilon must be a finite number >= 0, got -1'
    );
  });

  test('여러 필드가 틀리면 maxIterations, tolerance, epsilon 순으로 먼저 던진다', () => {
    expect(() => resolveIterationOptions({ maxIterations: 0, tolerance: -1, epsilon: -1 }, 'options')).toThrow(
      'options.maxIterations'
    );
    expect(() => resolveIterationOptions({ tolerance: -1, epsilon: -1 }, 'options')).toThrow('options.tolerance');
    expect(() => resolveIterationOptions({ maxIterations: 0, epsilon: -1 }, 'options')).toThrow(
      'options.maxIterations'
    );
    expect(() => resolveIterationOptions({ epsilon: -1 }, 'options')).toThrow('options.epsilon');
  });

  test('-0 tolerance와 epsilon은 통과하고 값이 그대로 전달된다', () => {
    const resolved = resolveIterationOptions({ tolerance: -0, epsilon: -0 }, 'options');
    expect(Object.is(resolved.tolerance, -0)).toBe(true);
    expect(Object.is(resolved.epsilon, -0)).toBe(true);
  });
});

describe('internal iteration-options — defaultJacobiMaxIterations', () => {
  test('sweep 수 상수는 10이다', () => {
    expect(DEFAULT_JACOBI_SWEEPS).toBe(10);
  });

  test('n <= 5는 이전 고정 기본값 100이다', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      expect(defaultJacobiMaxIterations(n)).toBe(100);
    }
  });

  test('n > 5는 10 sweep(10 * n * (n - 1) / 2)회다', () => {
    expect(defaultJacobiMaxIterations(6)).toBe(150);
    expect(defaultJacobiMaxIterations(20)).toBe(1900);
    expect(defaultJacobiMaxIterations(60)).toBe(17700);
    expect(defaultJacobiMaxIterations(100)).toBe(49500);
  });
});
