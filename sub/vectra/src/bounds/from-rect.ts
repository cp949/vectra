import type { BoundsWritable, RectLike } from '../types';
import { createBounds } from './create-bounds';
import { fromRectInto } from './from-rect-into';

/**
 * rect의 extent를 bounds로 변환해 새 plain bounds object로 반환한다.
 *
 * rect의 x/y를 min으로, x + width와 y + height를 max로 기록한다. line/point rect는
 * line/point bounds가 되어 bounds 기준으로는 non-empty가 된다.
 * negative dimension rect는 inverted bounds가 된다.
 *
 * @param rect bounds로 변환할 rect
 */
export function fromRect(rect: RectLike): BoundsWritable {
  return fromRectInto(createBounds(), rect);
}
