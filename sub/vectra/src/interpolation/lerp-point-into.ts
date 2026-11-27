import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { assertFinite5 } from './interpolation.internal';

/**
 * a와 b 사이의 선형 보간 좌표를 out에 기록하고 out을 반환한다.
 *
 * `t`를 `[0, 1]`로 clamp하지 않으며 extrapolation을 허용한다.
 * a, b의 x/y와 t는 finite number여야 한다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param a 보간 시작 좌표
 * @param b 보간 끝 좌표
 * @param t 보간 비율. clamp 없음, extrapolation 허용
 */
export function lerpPointInto<Out extends PointWritable>(out: Out, a: Point, b: Point, t: number): Out {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  assertFinite5(ax, ay, bx, by, t);
  out.x = ax + (bx - ax) * t;
  out.y = ay + (by - ay) * t;
  return out;
}
