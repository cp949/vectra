import type { PCAOptions } from './types';

/** PCA option default. caller가 미지정 옵션을 받았을 때 사용한다. */
export const DEFAULT_PCA_MAX_ITERATIONS = 100;
export const DEFAULT_PCA_TOLERANCE = 1e-10;
export const DEFAULT_PCA_EPSILON = 1e-9;

/** 검증된 PCA 반복 옵션. caller가 매번 재검사하지 않도록 묶어 전달한다. */
export interface ResolvedPCAOptions {
  readonly maxIterations: number;
  readonly tolerance: number;
  readonly epsilon: number;
  readonly useCorrelation: boolean;
}

/**
 * `PCAOptions`의 PCA-specific 필드(`useCorrelation`/`maxIterations`/`tolerance`/`epsilon`)를 검증하고
 * default를 채운 `ResolvedPCAOptions`를 만든다.
 *
 * `useCorrelation`은 boolean 또는 undefined여야 한다. `maxIterations`는 positive safe integer, `tolerance`/`epsilon`은
 * 0 이상 finite number다. 위반은 모두 `RangeError`. caller는 `orientation`/`mode`를 별도 helper로 검증한다.
 *
 * @param options 사용자 옵션. `undefined`이면 모든 필드에 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolvePCAOptions(options: PCAOptions | undefined, name: string): ResolvedPCAOptions {
  const useCorrelationRaw = options?.useCorrelation;
  let useCorrelation: boolean;
  if (useCorrelationRaw === undefined) {
    useCorrelation = false;
  } else if (typeof useCorrelationRaw !== 'boolean') {
    throw new RangeError(`${name}.useCorrelation must be a boolean, got ${String(useCorrelationRaw)}`);
  } else {
    useCorrelation = useCorrelationRaw;
  }

  const maxIterationsRaw = options?.maxIterations;
  let maxIterations: number;
  if (maxIterationsRaw === undefined) {
    maxIterations = DEFAULT_PCA_MAX_ITERATIONS;
  } else {
    if (!Number.isSafeInteger(maxIterationsRaw) || maxIterationsRaw <= 0) {
      throw new RangeError(`${name}.maxIterations must be a positive safe integer, got ${String(maxIterationsRaw)}`);
    }
    maxIterations = maxIterationsRaw;
  }

  const toleranceRaw = options?.tolerance;
  let tolerance: number;
  if (toleranceRaw === undefined) {
    tolerance = DEFAULT_PCA_TOLERANCE;
  } else {
    if (!Number.isFinite(toleranceRaw) || toleranceRaw < 0) {
      throw new RangeError(`${name}.tolerance must be a finite number >= 0, got ${String(toleranceRaw)}`);
    }
    tolerance = toleranceRaw;
  }

  const epsilonRaw = options?.epsilon;
  let epsilon: number;
  if (epsilonRaw === undefined) {
    epsilon = DEFAULT_PCA_EPSILON;
  } else {
    if (!Number.isFinite(epsilonRaw) || epsilonRaw < 0) {
      throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilonRaw)}`);
    }
    epsilon = epsilonRaw;
  }

  return { maxIterations, tolerance, epsilon, useCorrelation };
}
