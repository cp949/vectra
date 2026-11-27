import type { Bounds, BoundsWritable } from '../types/flat-shapes.internal';

/**
 * a와 b의 union bounds를 out에 기록한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 복사한다. 비-empty 입력끼리는 raw
 * min/max 자연식으로 합친다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param a 합칠 첫 번째 bounds
 * @param b 합칠 두 번째 bounds
 */
export function unionInto<Out extends BoundsWritable>(out: Out, a: Bounds, b: Bounds): Out {
  const aMinX = a.minX;
  const aMinY = a.minY;
  const aMaxX = a.maxX;
  const aMaxY = a.maxY;
  const aEmpty = aMaxX < aMinX || aMaxY < aMinY;

  const bMinX = b.minX;
  const bMinY = b.minY;
  const bMaxX = b.maxX;
  const bMaxY = b.maxY;
  const bEmpty = bMaxX < bMinX || bMaxY < bMinY;

  if (aEmpty && bEmpty) {
    // 둘 다 empty → a를 복사 (sentinel 유지)
    out.minX = aMinX;
    out.minY = aMinY;
    out.maxX = aMaxX;
    out.maxY = aMaxY;
  } else if (aEmpty) {
    // a만 empty → b를 복사
    out.minX = bMinX;
    out.minY = bMinY;
    out.maxX = bMaxX;
    out.maxY = bMaxY;
  } else if (bEmpty) {
    // b만 empty → a를 복사
    out.minX = aMinX;
    out.minY = aMinY;
    out.maxX = aMaxX;
    out.maxY = aMaxY;
  } else {
    // aliasing 안전 - 결과를 먼저 local에 계산한 뒤 기록한다
    const newMinX = aMinX < bMinX ? aMinX : bMinX;
    const newMinY = aMinY < bMinY ? aMinY : bMinY;
    const newMaxX = aMaxX > bMaxX ? aMaxX : bMaxX;
    const newMaxY = aMaxY > bMaxY ? aMaxY : bMaxY;
    out.minX = newMinX;
    out.minY = newMinY;
    out.maxX = newMaxX;
    out.maxY = newMaxY;
  }
  return out;
}
