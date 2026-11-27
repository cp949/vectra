import type { BoundsWritable } from '../types/flat-shapes.internal';

/**
 * out을 inverted sentinel empty bounds로 초기화한다.
 *
 * min은 (Infinity, Infinity), max는 (-Infinity, -Infinity)로 기록한다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 */
export function emptyInto<Out extends BoundsWritable>(out: Out): Out {
  out.minX = Infinity;
  out.minY = Infinity;
  out.maxX = -Infinity;
  out.maxY = -Infinity;
  return out;
}
