import type { RectLike, RectWritable } from '../types';
import { copyInto } from './copy-into';
import { createRect } from './create-rect';

/**
 * `RectLike` source의 component를 새 plain object로 복사해 반환한다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 *
 * @param rect 복사할 source rect
 */
export function rectFrom(rect: RectLike): RectWritable;
/**
 * x/y/width/height component로 새 plain rect writable을 만든다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 */
export function rectFrom(x: number, y: number, width: number, height: number): RectWritable;
export function rectFrom(rectOrX: RectLike | number, y?: number, width?: number, height?: number): RectWritable {
  if (typeof rectOrX === 'number') {
    return copyInto(createRect(), rectOrX, y as number, width as number, height as number);
  }
  return copyInto(createRect(), rectOrX);
}
