import type { BoundsLike, MatrixWritable } from '../types';
import { type ZoomToFitOptions, zoomToFitInto } from './zoom-to-fit-into';

/**
 * contentBounds를 padding 적용한 viewportBounds에 맞추는 transform matrix를 새 object로 반환한다.
 *
 * content 또는 padded viewport가 empty(`min >= max`)이면 identity matrix를 반환한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. bounds 또는 padding scalar가 finite하지 않으면 `RangeError`를 던진다.
 *
 * @param contentBounds viewport에 맞출 content bounds
 * @param viewportBounds content를 담을 viewport bounds. padding으로 안쪽으로 줄어든다.
 * @param options fit mode와 padding 옵션
 */
export function zoomToFit(
  contentBounds: BoundsLike,
  viewportBounds: BoundsLike,
  options?: ZoomToFitOptions
): MatrixWritable {
  return zoomToFitInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, contentBounds, viewportBounds, options);
}
