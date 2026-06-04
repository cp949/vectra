/**
 * constrainResizeInto — proposed 크기를 constraint 규칙으로 보정해 out에 기록한다.
 */

import type { ResizeConstraintOptions } from './types';

/**
 * proposed { width, height }를 constraint 규칙으로 보정해 out에 기록하고 out을 반환한다.
 *
 * options 미지정 시 proposed를 그대로 기록한다.
 * aspectLocked 시 current 기준 ratio를 유지한다. shorter axis를 longer axis scale에 맞춰 보정한다.
 * ratio 보정 먼저, 그다음 min/max clamp. min > max이면 min 우선.
 * current.width === 0 또는 current.height === 0에서 aspectLocked: true면 NaN propagation.
 * NaN/Infinity 입력은 silent propagation. throw 없음.
 *
 * @param out 보정된 크기를 기록할 writable output
 * @param current 현재 { width, height } (aspectLocked 기준으로 사용)
 * @param proposed 새로 제안된 { width, height }
 * @param options aspectLocked, min/max 옵션
 */
export function constrainResizeInto<Out extends { width: number; height: number }>(
  out: Out,
  current: { width: number; height: number },
  proposed: { width: number; height: number },
  options?: ResizeConstraintOptions
): Out {
  let w = proposed.width;
  let h = proposed.height;

  if (options?.aspectLocked) {
    // current ratio 기준으로 shorter axis를 longer axis scale에 맞춰 보정한다.
    // scale factor: w / current.width, h / current.height
    // 더 큰 scale(longer axis)을 기준으로 양 축을 맞춘다.
    // current 축이 0이면 ratio 또는 scale이 Infinity/NaN → NaN으로 통일한다.
    const ratio = current.width / current.height;
    if (!Number.isFinite(ratio) || ratio === 0) {
      // current degenerate (width===0 또는 height===0) → NaN propagation
      out.width = Number.NaN;
      out.height = Number.NaN;
      return out;
    }
    const scaleW = w / current.width;
    const scaleH = h / current.height;
    if (scaleW >= scaleH) {
      // width scale이 더 크거나 같음 → width dominant
      h = w / ratio;
    } else {
      // height scale이 더 큼 → height dominant
      w = h * ratio;
    }
  }

  // min/max clamp: min > max이면 min 우선
  const minW = Math.max(0, options?.minWidth ?? 0);
  const maxW = options?.maxWidth ?? Infinity;
  const minH = Math.max(0, options?.minHeight ?? 0);
  const maxH = options?.maxHeight ?? Infinity;

  // clamp: [min, max] 범위 적용 후 min > max 케이스를 후처리로 min 우선 보장
  out.width = Math.max(minW, Math.min(maxW, w));
  out.height = Math.max(minH, Math.min(maxH, h));

  return out;
}
