import type { Bounds, RectWritable } from '../types/flat-shapes.internal';

/**
 * bounds extent를 rect component로 변환해 out에 기록한다.
 *
 * `x=minX`, `y=minY`, `width=maxX-minX`, `height=maxY-minY`를 기록한다.
 * out과 bounds가 같은 storage를 공유해도 안전하다.
 *
 * @param out 변환 결과를 기록할 사각형 객체
 * @param bounds rect로 변환할 bounds
 */
export function fromBoundsInto<Out extends RectWritable>(out: Out, bounds: Bounds): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;
  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return out;
}
