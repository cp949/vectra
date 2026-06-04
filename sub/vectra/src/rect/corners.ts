import type { RectLike } from '../types';
import { cornersInto } from './corners-into';

/**
 * rect의 4개 corner point를 새 배열로 반환한다.
 *
 * `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새 `{ x, y }` object를 담은
 * 배열을 반환한다. 반환 배열 길이는 항상 4이다.
 *
 * empty rect(`width <= 0 || height <= 0`)에서도 raw 좌표로 4개 point를 반환한다.
 *
 * @param rect corner를 읽을 rect
 */
export function corners(rect: RectLike): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  cornersInto(out, rect);
  return out;
}
