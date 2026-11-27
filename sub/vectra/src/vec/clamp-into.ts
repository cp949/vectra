import type { Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * input의 각 성분을 [min, max] 범위로 clamp하여 out에 기록하고 out을 반환한다.
 *
 * input, min, max 중 하나가 out과 같은 object여도 안전하다.
 * NaN, Infinity, -Infinity 입력은 Math.min/Math.max 정책을 따른다.
 *
 * caller가 min <= max 순서로 전달해야 한다. min > max이면 결과는 정의되지 않는다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input clamp할 입력 벡터
 * @param min 각 성분의 하한 벡터
 * @param max 각 성분의 상한 벡터
 */
export function clampInto<Out extends PointWritable>(out: Out, input: Point, min: Point, max: Point): Out {
  const ix = input.x;
  const iy = input.y;
  const minX = min.x;
  const minY = min.y;
  const maxX = max.x;
  const maxY = max.y;
  out.x = Math.min(Math.max(ix, minX), maxX);
  out.y = Math.min(Math.max(iy, minY), maxY);
  return out;
}
