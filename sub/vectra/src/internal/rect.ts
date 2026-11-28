/**
 * point (px, py)가 axis-aligned rect 안에 있는지 판정한다.
 *
 * closed boundary 정책. empty rect(width <= 0 또는 height <= 0)는 false.
 *
 * @param rx rect의 x (left)
 * @param ry rect의 y (top)
 * @param rw rect의 width
 * @param rh rect의 height
 * @param px point x
 * @param py point y
 */
export function rectContainsPointXY(rx: number, ry: number, rw: number, rh: number, px: number, py: number): boolean {
  if (rw <= 0 || rh <= 0) return false;
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
