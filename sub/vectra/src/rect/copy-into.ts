import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * rect 또는 x/y/width/height component를 out에 복사한다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 * out과 source rect가 같은 object여도 안전하다.
 *
 * @param out rect component를 기록할 writable output
 * @param rect 복사할 source rect
 */
export function copyInto<Out extends RectWritable>(out: Out, rect: RectLike): Out;
/**
 * rect 또는 x/y/width/height component를 out에 복사한다.
 *
 * width/height를 정규화하지 않고 입력값 그대로 기록한다.
 *
 * @param out rect component를 기록할 writable output
 * @param x 기록할 x 좌표
 * @param y 기록할 y 좌표
 * @param width 기록할 width
 * @param height 기록할 height
 */
export function copyInto<Out extends RectWritable>(out: Out, x: number, y: number, width: number, height: number): Out;
export function copyInto<Out extends RectWritable>(
  out: Out,
  rectOrX: RectLike | number,
  y?: number,
  width?: number,
  height?: number
): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = typeof rectOrX === 'number' ? rectOrX : readRectX(rectOrX);
  const nextY = typeof rectOrX === 'number' ? y : readRectY(rectOrX);
  const w = typeof rectOrX === 'number' ? (width as number) : readRectWidth(rectOrX);
  const h = typeof rectOrX === 'number' ? (height as number) : readRectHeight(rectOrX);
  out.x = x;
  out.y = nextY as number;
  out.width = w;
  out.height = h;
  return out;
}
