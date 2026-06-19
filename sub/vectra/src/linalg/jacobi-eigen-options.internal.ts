import type { IterationOptions } from './types';

/** `IterationOptions`의 default. caller가 미지정 옵션을 받았을 때 사용한다. */
export const DEFAULT_ITERATION_MAX = 100;
export const DEFAULT_ITERATION_TOLERANCE = 1e-10;
export const DEFAULT_ITERATION_EPSILON = 1e-9;

/** 검증/분류된 `IterationOptions`. caller가 매번 다시 검사하지 않도록 결과로 묶어 전달한다. */
export interface ResolvedIterationOptions {
  readonly maxIterations: number;
  readonly tolerance: number;
  readonly epsilon: number;
}

/**
 * `IterationOptions`의 세 필드를 검증해 default를 채운 `ResolvedIterationOptions`를 만든다.
 *
 * 검증 순서는 `maxIterations` → `tolerance` → `epsilon`이며, 어느 필드 실패도 `RangeError`다.
 * matrix/vector 입력 검증보다 먼저 호출한다.
 *
 * @param options 사용자 옵션. `undefined`이면 모든 필드에 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolveIterationOptions(options: IterationOptions | undefined, name: string): ResolvedIterationOptions {
  const maxIterations = options?.maxIterations;
  let resolvedMaxIterations: number;
  if (maxIterations === undefined) {
    resolvedMaxIterations = DEFAULT_ITERATION_MAX;
  } else {
    if (!Number.isSafeInteger(maxIterations) || maxIterations <= 0) {
      throw new RangeError(`${name}.maxIterations must be a positive safe integer, got ${String(maxIterations)}`);
    }
    resolvedMaxIterations = maxIterations;
  }

  const tolerance = options?.tolerance;
  let resolvedTolerance: number;
  if (tolerance === undefined) {
    resolvedTolerance = DEFAULT_ITERATION_TOLERANCE;
  } else {
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      throw new RangeError(`${name}.tolerance must be a finite number >= 0, got ${String(tolerance)}`);
    }
    resolvedTolerance = tolerance;
  }

  const epsilon = options?.epsilon;
  let resolvedEpsilon: number;
  if (epsilon === undefined) {
    resolvedEpsilon = DEFAULT_ITERATION_EPSILON;
  } else {
    if (!Number.isFinite(epsilon) || epsilon < 0) {
      throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
    }
    resolvedEpsilon = epsilon;
  }

  return { maxIterations: resolvedMaxIterations, tolerance: resolvedTolerance, epsilon: resolvedEpsilon };
}
