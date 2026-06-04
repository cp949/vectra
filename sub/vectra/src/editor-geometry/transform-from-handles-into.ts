/**
 * transformFromHandlesInto — handle drag 결과를 affine transform matrix로 환산한다.
 */

import type { MatrixWritable } from '../types';
import { composeTransformFromHandles, defaultAnchorForHandle } from './transform-compose.internal';
import type { TransformFromHandlesInput, TransformFromHandlesOptions } from './types';

/**
 * handle drag 결과를 affine transform matrix로 환산해 `out`에 기록한다.
 *
 * unrotated AABB 기준 transform이다. rotation 합성은 caller 책임.
 *
 * - corner handle(nw/ne/se/sw): 두 축 scale + translate.
 * - edge handle(n/s/e/w): 단일 축 scale + translate.
 * - `options.aspectLocked === true`: corner handle 드래그를 등비례(min scale)로 보정.
 *   edge handle에서는 무시.
 * - `options.fromAnchor` 미지정: handle의 대각 anchor를 고정점으로 사용.
 *   (예: 'se' handle → 'top-left' anchor 고정)
 *
 * 실패 조건 — `false` 반환 + `out` 미수정:
 * - 영향 있는 축의 기존 extent가 0 (degenerate bounds, scale 정의 불가)
 * - NaN/Infinity 입력으로 인해 산출값이 유한하지 않음
 *
 * @param out handle drag 결과 matrix를 기록할 writable output
 * @param input bounds / handle / to 위치를 포함한 입력
 * @param options aspectLocked / fromAnchor 옵션
 */
export function transformFromHandlesInto<Out extends MatrixWritable>(
  out: Out,
  input: TransformFromHandlesInput,
  options?: TransformFromHandlesOptions
): boolean {
  const { bounds, handle, to } = input;
  const anchor = options?.fromAnchor ?? defaultAnchorForHandle(handle);
  const aspectLocked = options?.aspectLocked ?? false;

  return composeTransformFromHandles(out, bounds, handle, to, anchor, aspectLocked);
}
