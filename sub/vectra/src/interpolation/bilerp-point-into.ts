import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { assertFinite5 } from './interpolation.internal';

/**
 * 4개의 코너 좌표로 이루어진 grid에서 bilinear interpolation 결과를 out에 기록하고 out을 반환한다.
 *
 * 파라미터 순서: `p00=(tx=0,ty=0)`, `p10=(tx=1,ty=0)`, `p01=(tx=0,ty=1)`, `p11=(tx=1,ty=1)`.
 * x-sweep: p00→p10, y-sweep: p00→p01.
 * 계산: `lerp(lerp(p00, p10, tx), lerp(p01, p11, tx), ty)` (component-wise).
 * `tx`, `ty`를 clamp하지 않으며 extrapolation을 허용한다.
 * 모든 input의 x/y와 tx/ty는 finite number여야 한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param p00 corner (tx=0, ty=0)
 * @param p10 corner (tx=1, ty=0) — x 방향으로 이동
 * @param p01 corner (tx=0, ty=1) — y 방향으로 이동
 * @param p11 corner (tx=1, ty=1)
 * @param tx x 방향 보간 비율. clamp 없음, extrapolation 허용
 * @param ty y 방향 보간 비율. clamp 없음, extrapolation 허용
 */
export function bilerpPointInto<Out extends PointWritable>(
  out: Out,
  p00: Point,
  p10: Point,
  p01: Point,
  p11: Point,
  tx: number,
  ty: number
): Out {
  const x00 = p00.x;
  const y00 = p00.y;
  const x10 = p10.x;
  const y10 = p10.y;
  const x01 = p01.x;
  const y01 = p01.y;
  const x11 = p11.x;
  const y11 = p11.y;
  assertFinite5(x00, y00, x10, y10, x01);
  assertFinite5(y01, x11, y11, tx, ty);

  // x 방향 1차 보간: lerp(p00, p10, tx), lerp(p01, p11, tx)
  const lx0x = x00 + (x10 - x00) * tx;
  const lx0y = y00 + (y10 - y00) * tx;
  const lx1x = x01 + (x11 - x01) * tx;
  const lx1y = y01 + (y11 - y01) * tx;

  // y 방향 2차 보간: lerp(lx0, lx1, ty)
  out.x = lx0x + (lx1x - lx0x) * ty;
  out.y = lx0y + (lx1y - lx0y) * ty;
  return out;
}
