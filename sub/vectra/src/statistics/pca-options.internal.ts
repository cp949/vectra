import { type ResolvedIterationOptions, resolveIterationOptions } from '../internal/iteration-options';
import type { PCAOptions } from './types';

/** 검증된 PCA 반복 옵션. caller가 매번 재검사하지 않도록 묶어 전달한다. */
export interface ResolvedPCAOptions extends ResolvedIterationOptions {
  readonly useCorrelation: boolean;
}

/**
 * `PCAOptions`의 PCA-specific 필드(`useCorrelation`/`maxIterations`/`tolerance`/`epsilon`)를 검증하고
 * default를 채운 `ResolvedPCAOptions`를 만든다.
 *
 * `useCorrelation`은 boolean 또는 undefined여야 한다. 이 검증이 반복 옵션 검증보다 먼저 일어난다.
 * 반복 옵션 세 필드는 `resolveIterationOptions`가 검증한다. 위반은 모두 `RangeError`.
 * caller는 `orientation`/`mode`를 별도 helper로 검증한다.
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

  const { maxIterations, tolerance, epsilon } = resolveIterationOptions(options, name);
  return { maxIterations, tolerance, epsilon, useCorrelation };
}
