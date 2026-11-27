import type { Bounds, BoundsWritable } from '../types/flat-shapes.internal';

/**
 * a와 b의 양수-area intersection bounds를 out에 기록한다.
 *
 * 둘 중 하나라도 empty이거나 겹침 결과의 area가 0이면 false를 반환하고 out을 수정하지 않는다.
 * edge touch, corner-only 접촉, line/point bounds overlap은 false이다. input과 out이 같은
 * object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param a 교차시킬 첫 번째 bounds
 * @param b 교차시킬 두 번째 bounds
 */
export function intersectionInto(out: BoundsWritable, a: Bounds, b: Bounds): boolean {
  const aMinX = a.minX;
  const aMinY = a.minY;
  const aMaxX = a.maxX;
  const aMaxY = a.maxY;
  if (aMaxX < aMinX || aMaxY < aMinY) return false;

  const bMinX = b.minX;
  const bMinY = b.minY;
  const bMaxX = b.maxX;
  const bMaxY = b.maxY;
  if (bMaxX < bMinX || bMaxY < bMinY) return false;

  // aliasing 안전 - 결과를 먼저 local에 계산한 뒤 기록한다
  const newMinX = aMinX > bMinX ? aMinX : bMinX;
  const newMinY = aMinY > bMinY ? aMinY : bMinY;
  const newMaxX = aMaxX < bMaxX ? aMaxX : bMaxX;
  const newMaxY = aMaxY < bMaxY ? aMaxY : bMaxY;

  // area=0인 경우(edge touch, corner-only, line bounds overlap)는 기록하지 않는다
  if (newMaxX <= newMinX || newMaxY <= newMinY) return false;

  out.minX = newMinX;
  out.minY = newMinY;
  out.maxX = newMaxX;
  out.maxY = newMaxY;
  return true;
}
