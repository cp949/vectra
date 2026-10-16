import { combineVectorsInto } from './combine-vectors-into';
import type { VecLike } from './types';

/**
 * 두 vector를 callback으로 합성한 결과를 새 `number[]`로 반환한다.
 *
 * finite/non-finite 입력과 결과 처리 정책은 `combineVectorsInto`와 동일하다.
 * clamp/정규화/fallback 정책은 `combineVectorsInto`와 동일하다.
 * 결과 entry의 `-0`은 `+0`으로 canonicalize한다.
 */
export function combineVectors(a: VecLike, b: VecLike, fn: (a: number, b: number, index: number) => number): number[] {
  return combineVectorsInto(new Array<number>(a.length), a, b, fn);
}
