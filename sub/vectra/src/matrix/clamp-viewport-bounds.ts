import type { BoundsLike, BoundsWritable } from '../types';
import { type ClampViewportBoundsOptions, clampViewportBoundsInto } from './clamp-viewport-bounds-into';

/**
 * viewportBounds가 padding 적용한 contentBounds를 벗어나지 않도록 translate한 결과를 새 object로 반환한다.
 *
 * viewport 크기는 보존하고 translation만 한다. 한 축에서 viewport가 padded content보다 크면 그 축은
 * padded content 중심에 viewport 중심을 맞춘다. 작거나 같으면 viewport를 padded content 안쪽으로 옮긴다.
 * viewport가 inverted empty이거나 padded content가 empty이면 viewport의 normalized copy를 반환한다.
 * bounds 또는 padding scalar가 finite하지 않으면 `RangeError`를 던진다.
 *
 * @param viewportBounds 보정할 viewport bounds
 * @param contentBounds viewport를 가둘 content bounds. padding으로 안쪽으로 줄어든다.
 * @param options padding 옵션
 */
export function clampViewportBounds(
  viewportBounds: BoundsLike,
  contentBounds: BoundsLike,
  options?: ClampViewportBoundsOptions
): BoundsWritable {
  return clampViewportBoundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, viewportBounds, contentBounds, options);
}
