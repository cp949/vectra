import type { RectLike, RectTuple } from '../types';

function isRectTuple(rect: RectLike): rect is RectTuple {
  return Array.isArray(rect);
}

/** rect input의 x component를 읽는다. */
export function readRectX(rect: RectLike): number {
  return isRectTuple(rect) ? rect[0] : rect.x;
}

/** rect input의 y component를 읽는다. */
export function readRectY(rect: RectLike): number {
  return isRectTuple(rect) ? rect[1] : rect.y;
}

/** rect input의 width component를 읽는다. */
export function readRectWidth(rect: RectLike): number {
  return isRectTuple(rect) ? rect[2] : rect.width;
}

/** rect input의 height component를 읽는다. */
export function readRectHeight(rect: RectLike): number {
  return isRectTuple(rect) ? rect[3] : rect.height;
}
