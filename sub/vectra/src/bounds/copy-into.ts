import type { Bounds, BoundsWritable } from '../types/flat-shapes.internal';

/**
 * 경계 좌표를 out에 그대로 복사한다.
 *
 * 뒤집힌 경계도 정규화하지 않는다. out과 bounds가 같은 객체여도 안전하다.
 *
 * @param out 경계 좌표를 기록할 경계 상자 객체
 * @param bounds 복사할 경계 상자
 */
export function copyInto<Out extends BoundsWritable>(out: Out, bounds: Bounds): Out {
  const { minX, minY, maxX, maxY } = bounds;
  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
