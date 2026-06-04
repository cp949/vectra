import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike } from '../types';

/**
 * other rect가 rect의 closed boundary 안에 완전히 포함되는지 반환한다.
 *
 * other가 empty이면 true를 반환한다.
 * rect가 empty이면 other도 empty일 때만 true가 된다.
 *
 * @param rect 포함 영역으로 사용할 rect
 * @param other rect 안에 포함되는지 검사할 rect
 */
export function containsRect(rect: RectLike, other: RectLike): boolean {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);
  const otherX = readRectX(other);
  const otherY = readRectY(other);
  const otherWidth = readRectWidth(other);
  const otherHeight = readRectHeight(other);
  const otherEmpty = otherWidth <= 0 || otherHeight <= 0;
  const rectEmpty = width <= 0 || height <= 0;

  if (otherEmpty) return true;
  if (rectEmpty) return false;

  return x <= otherX && otherX + otherWidth <= x + width && y <= otherY && otherY + otherHeight <= y + height;
}
