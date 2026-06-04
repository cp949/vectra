import type { MatrixWritable, RectLike } from '../types';
import { type FitRectOptions, fitRectInto } from './fit-rect-into';

/**
 * srcRect를 destRect에 fit하는 transform matrix를 새 object로 반환한다.
 *
 * src 또는 dest가 empty(`width <= 0` 또는 `height <= 0`)이면 identity matrix를 반환한다.
 * mode가 유효하지 않으면 `RangeError`를 던진다. scalar component가 finite하지 않으면 `RangeError`를 던진다.
 *
 * `options.flipY`가 `true`이면 y축을 뒤집는다(`d < 0`).
 * contain / cover 모드에서는 scaled src center를 dest center에 맞추되 수직 반전된 채 배치된다.
 * stretch 모드에서는 y축 scale만 반전된다.
 * src 또는 dest가 empty이면 `flipY: true`여도 identity matrix를 반환한다.
 *
 * @param srcRect 변환할 source rect
 * @param destRect 목적지 rect
 * @param options fit 옵션
 */
export function fitRect(srcRect: RectLike, destRect: RectLike, options?: FitRectOptions): MatrixWritable {
  return fitRectInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, srcRect, destRect, options);
}
