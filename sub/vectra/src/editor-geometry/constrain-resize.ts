/**
 * constrainResize — proposed 크기를 constraint 규칙으로 보정해 plain object로 반환한다.
 */

import { constrainResizeInto } from './constrain-resize-into';
import type { ResizeConstraintOptions } from './types';

/**
 * proposed { width, height }를 constraint 규칙으로 보정해 plain object로 반환한다.
 *
 * options 미지정 시 proposed의 { width, height }를 그대로 반환한다.
 * aspectLocked 시 current 기준 ratio를 유지한다. shorter axis를 longer axis scale에 맞춰 보정한다.
 * ratio 보정 먼저, 그다음 min/max clamp. min > max이면 min 우선.
 * current.width === 0 또는 current.height === 0에서 aspectLocked: true면 NaN propagation.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 *
 * @param current 현재 { width, height } (aspectLocked 기준으로 사용)
 * @param proposed 새로 제안된 { width, height }
 * @param options aspectLocked, min/max 옵션
 */
export function constrainResize(
  current: { width: number; height: number },
  proposed: { width: number; height: number },
  options?: ResizeConstraintOptions
): { width: number; height: number } {
  return constrainResizeInto({ width: 0, height: 0 }, current, proposed, options);
}
