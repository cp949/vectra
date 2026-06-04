import { readRectHeight, readRectWidth } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * rect의 aspect ratio(`width / height`)를 반환한다.
 *
 * empty rect(`width <= 0 || height <= 0`)는 의미 있는 aspect ratio가 없으므로 `NaN`을
 * 반환한다. negative dimension rect도 empty로 본다. `0`, `Infinity` 같은 sentinel은 만들지
 * 않는다.
 * non-empty rect는 raw division 결과를 반환하며 finite validation은 하지 않는다.
 *
 * @param rect aspect ratio를 측정할 rect
 */
export function aspectRatio(rect: RectLike): number {
  const w = readRectWidth(rect);
  const h = readRectHeight(rect);
  if (w <= 0 || h <= 0) {
    return Number.NaN;
  }
  return w / h;
}
