import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * 두 rect의 union rect를 out에 기록한다.
 *
 * 한쪽이 empty이면 다른 쪽을 복사하고, 둘 다 empty이면 a를 그대로 복사한다.
 * 비-empty 두 rect는 raw min/max extent로 결합한다.
 * out과 입력 rect가 같은 object여도 안전하다.
 *
 * @param out union 결과 rect를 기록할 writable output
 * @param a union을 계산할 첫 번째 rect
 * @param b union을 계산할 두 번째 rect
 */
export function unionInto<Out extends RectWritable>(out: Out, a: RectLike, b: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const ax = readRectX(a);
  const ay = readRectY(a);
  const aw = readRectWidth(a);
  const ah = readRectHeight(a);
  const bx = readRectX(b);
  const by = readRectY(b);
  const bw = readRectWidth(b);
  const bh = readRectHeight(b);

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
