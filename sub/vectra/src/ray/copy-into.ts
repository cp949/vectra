import type { Ray, RayWritable } from '../types/flat-shapes.internal';

/**
 * `Ray` source의 component를 `out`에 복사하고 `out`을 반환한다.
 *
 * alias 호출에서도 안전하도록 모든 좌표를 먼저 읽은 뒤 기록한다.
 */
export function copyInto<Out extends RayWritable>(out: Out, ray: Ray): Out {
  const { ox, oy, dx, dy } = ray;
  out.ox = ox;
  out.oy = oy;
  out.dx = dx;
  out.dy = dy;
  return out;
}
