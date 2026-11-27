import type { MatrixWritable, Point } from '../types/flat-shapes.internal';

/**
 * point를 중심으로 scale하는 matrix를 out에 기록하고 out을 반환한다.
 *
 * `T(point) * S(scale) * T(-point)`를 직접 전개해 기록한다.
 * 축별 배율을 지정한다. 균일 배율은 `scale.x`와 `scale.y`에 같은 값을 넣는다.
 *
 * 결과: `a=sx, b=0, c=0, d=sy, tx=px*(1-sx), ty=py*(1-sy)`.
 *
 * @param out transform matrix를 기록할 행렬 객체
 * @param point scale 중심점
 * @param scale x축과 y축 배율
 */
export function scaleAroundPointInto<Out extends MatrixWritable>(out: Out, point: Point, scale: Point): Out {
  const px = point.x;
  const py = point.y;
  const sx = scale.x;
  const sy = scale.y;

  out.a = sx;
  out.b = 0;
  out.c = 0;
  out.d = sy;
  out.tx = px * (1 - sx);
  out.ty = py * (1 - sy);
  return out;
}
