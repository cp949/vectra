import type { Rect, RectWritable } from '../types/flat-shapes.internal';

/**
 * 두 rect의 union rect를 out에 기록한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 그대로 복사한다.
 * 비-empty 두 rect는 raw min/max extent로 결합한다.
 * out과 입력 rect가 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 사각형 객체
 * @param a union을 계산할 첫 번째 rect
 * @param b union을 계산할 두 번째 rect
 */
export function unionInto<Out extends RectWritable>(out: Out, a: Rect, b: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const ax = a.x;
  const ay = a.y;
  const aw = a.width;
  const ah = a.height;
  const bx = b.x;
  const by = b.y;
  const bw = b.width;
  const bh = b.height;

  const aEmpty = aw <= 0 || ah <= 0;
  const bEmpty = bw <= 0 || bh <= 0;

  if (aEmpty && bEmpty) {
    out.x = ax;
    out.y = ay;
    out.width = aw;
    out.height = ah;
  } else if (aEmpty) {
    out.x = bx;
    out.y = by;
    out.width = bw;
    out.height = bh;
  } else if (bEmpty) {
    out.x = ax;
    out.y = ay;
    out.width = aw;
    out.height = ah;
  } else {
    const newX = ax < bx ? ax : bx;
    const newY = ay < by ? ay : by;
    const newRight = ax + aw > bx + bw ? ax + aw : bx + bw;
    const newBottom = ay + ah > by + bh ? ay + ah : by + bh;
    out.x = newX;
    out.y = newY;
    out.width = newRight - newX;
    out.height = newBottom - newY;
  }
  return out;
}
