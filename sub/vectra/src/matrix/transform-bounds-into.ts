import type { Bounds, BoundsWritable, Matrix } from '../types/flat-shapes.internal';

/**
 * bounds의 네 corner를 matrix로 변환한 AABB를 out에 기록하고 out을 반환한다.
 *
 * empty bounds는 sentinel empty bounds를 기록한다. oriented bounds가 아니라 axis-aligned bounds로
 * 감싼다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 변환된 AABB bounds를 기록할 객체
 * @param matrix bounds corner에 적용할 matrix
 * @param bounds 변환할 bounds
 */
export function transformBoundsInto<Out extends BoundsWritable>(out: Out, matrix: Matrix, bounds: Bounds): Out {
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  // aliasing 안전: bounds의 모든 값을 local 변수로 먼저 읽는다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // empty sentinel pass-through: isEmpty 조건에서 empty sentinel을 그대로 기록한다
  if (maxX < minX || maxY < minY) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  // 네 corner를 local scalar로 변환한다
  const x0t = a * minX + c * minY + tx;
  const y0t = b * minX + d * minY + ty;
  const x1t = a * maxX + c * minY + tx;
  const y1t = b * maxX + d * minY + ty;
  const x2t = a * minX + c * maxY + tx;
  const y2t = b * minX + d * maxY + ty;
  const x3t = a * maxX + c * maxY + tx;
  const y3t = b * maxX + d * maxY + ty;

  out.minX = Math.min(x0t, x1t, x2t, x3t);
  out.minY = Math.min(y0t, y1t, y2t, y3t);
  out.maxX = Math.max(x0t, x1t, x2t, x3t);
  out.maxY = Math.max(y0t, y1t, y2t, y3t);

  return out;
}
