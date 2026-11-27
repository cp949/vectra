import type { Bounds, PointWritable } from '../types/flat-shapes.internal';

/**
 * bounds의 low point인 min 좌표를 out에 기록하고 out을 반환한다.
 *
 * empty/sentinel bounds에서도 raw min 좌표를 그대로 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 최솟값 좌표를 기록할 점 객체
 * @param bounds min 좌표를 읽을 bounds
 */
export function lowInto<Out extends PointWritable>(out: Out, bounds: Bounds): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const x = bounds.minX;
  const y = bounds.minY;
  out.x = x;
  out.y = y;
  return out;
}
