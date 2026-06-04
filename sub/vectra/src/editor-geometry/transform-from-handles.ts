/**
 * transformFromHandles — handle drag 결과를 plain MatrixLike object로 반환하는 companion.
 */

import { transformFromHandlesInto } from './transform-from-handles-into';
import type { TransformFromHandlesInput, TransformFromHandlesOptions } from './types';

/**
 * handle drag 결과를 plain MatrixLike object로 반환한다.
 *
 * `transformFromHandlesInto`의 allocation companion이다.
 * 실패(degenerate bounds, NaN 입력) 시 `undefined`를 반환한다.
 *
 *
 * clamp/정규화/fallback 정책은 `transformFromHandlesInto`와 동일하다.
 * caller-responsibility 가정은 `transformFromHandlesInto`와 동일하다.
 * @param input bounds / handle / to 위치를 포함한 입력
 * @param options aspectLocked / fromAnchor 옵션
 */
export function transformFromHandles(
  input: TransformFromHandlesInput,
  options?: TransformFromHandlesOptions
): { a: number; b: number; c: number; d: number; tx: number; ty: number } | undefined {
  const out = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 };
  const ok = transformFromHandlesInto(out, input, options);
  return ok ? out : undefined;
}
