import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * from에서 to 방향 단위 벡터를 out에 기록하고 out을 반환한다.
 *
 * from === to (같은 점) 또는 zero-length 차이 벡터에서는 throw하지 않고 (0, 0)을 기록한다.
 * from 또는 to가 out과 같은 object여도 안전하다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 out에 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param from 방향 벡터 시작점
 * @param to 방향 벡터 끝점
 */
export function directionToInto<Out extends PointWritable>(out: Out, from: Point, to: Point): Out {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = hypot2(dx, dy);

  out.x = len === 0 ? 0 : dx / len;
  out.y = len === 0 ? 0 : dy / len;
  return out;
}
