import type { BoundsWritable } from '../types/flat-shapes.internal';

/**
 * point (px, py)가 axis-aligned bounds 안에 있는지 판정한다.
 *
 * closed boundary 정책. inverted bounds(min > max)는 false.
 *
 * @param minX bounds min x
 * @param minY bounds min y
 * @param maxX bounds max x
 * @param maxY bounds max y
 * @param px point x
 * @param py point y
 */
export function boundsContainsPointXY(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  px: number,
  py: number
): boolean {
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

/** 네 경계 좌표가 0인 평평한 경계 상자를 만든다. */
export function createZeroBounds(): BoundsWritable {
  return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
}
