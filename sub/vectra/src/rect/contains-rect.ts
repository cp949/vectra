import type { Rect } from '../types/flat-shapes.internal';

/**
 * other rect가 rect의 closed boundary 안에 완전히 포함되는지 반환한다.
 *
 * other가 empty이면 true를 반환한다.
 * rect가 empty이면 other도 empty일 때만 true가 된다.
 *
 * @param rect 포함 영역으로 사용할 rect
 * @param other rect 안에 포함되는지 검사할 rect
 */
export function containsRect(rect: Rect, other: Rect): boolean {
  const x = rect.x;
  const y = rect.y;
  const width = rect.width;
  const height = rect.height;
  const otherX = other.x;
  const otherY = other.y;
  const otherWidth = other.width;
  const otherHeight = other.height;
  const otherEmpty = otherWidth <= 0 || otherHeight <= 0;
  const rectEmpty = width <= 0 || height <= 0;

  if (otherEmpty) return true;
  if (rectEmpty) return false;

  return x <= otherX && otherX + otherWidth <= x + width && y <= otherY && otherY + otherHeight <= y + height;
}
