import type { Bounds, BoundsWritable, Point } from '../types/flat-shapes.internal';

/**
 * bounds를 offset만큼 평행 이동한 결과를 out에 기록한다.
 *
 * empty sentinel bounds에 finite offset을 더하면 sentinel 상태가 유지된다. input과 out이 같은
 * object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param bounds 이동할 bounds
 * @param offset min과 max에 더할 이동 벡터
 */
export function translateInto<Out extends BoundsWritable>(out: Out, bounds: Bounds, offset: Point): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const minX = bounds.minX + offset.x;
  const minY = bounds.minY + offset.y;
  const maxX = bounds.maxX + offset.x;
  const maxY = bounds.maxY + offset.y;
  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
