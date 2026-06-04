import { bincountInto } from './bincount-into';
import type { BincountOptions } from './types';

/**
 * `labels`의 빈도 count를 새 `number[]`로 반환한다.
 *
 * 정책, 실패 분기, length 결정 규칙은 `bincountInto`와 동일하다. 결과 배열은 fresh `number[]`이며 `-0`은
 * `0`으로 canonicalize한다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `bincountInto`와 동일하다.
 * @param labels count 대상 non-negative safe integer 배열. mutate하지 않는다.
 * @param options 옵션. `minLength` 기본 미지정.
 */
export function bincount(labels: readonly number[], options?: BincountOptions): number[] {
  return bincountInto([], labels, options);
}
