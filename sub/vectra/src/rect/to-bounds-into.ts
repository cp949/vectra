import type { BoundsWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect extent를 bounds로 변환해 out에 기록한다.
 *
 * `minX = x`, `minY = y`, `maxX = x + width`, `maxY = y + height`를 기록한다.
 * out과 rect가 같은 storage를 공유해도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param rect bounds로 변환할 rect
 */
export function toBoundsInto<Out extends BoundsWritable>(out: Out, rect: Rect): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y;
  const w = rect.width;
  const h = rect.height;
  out.minX = x;
  out.minY = y;
  out.maxX = x + w;
  out.maxY = y + h;
  return out;
}
