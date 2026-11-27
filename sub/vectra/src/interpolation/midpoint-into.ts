import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { assertFinite4 } from './interpolation.internal';

/**
 * a와 b의 중점을 out에 기록하고 out을 반환한다.
 *
 * `lerpPointInto(out, a, b, 0.5)`와 동일한 결과다.
 * a, b의 x/y는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param a 중점을 구할 첫 번째 좌표
 * @param b 중점을 구할 두 번째 좌표
 */
export function midpointInto<Out extends PointWritable>(out: Out, a: Point, b: Point): Out {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  assertFinite4(ax, ay, bx, by);
  out.x = ax + (bx - ax) * 0.5;
  out.y = ay + (by - ay) * 0.5;
  return out;
}
