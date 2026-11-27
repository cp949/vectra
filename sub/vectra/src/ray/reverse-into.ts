import type { Ray, RayWritable } from '../types/flat-shapes.internal';

/**
 * `dx`, `dy`의 부호를 반전해 `out`에 기록하고 `out`을 반환한다.
 *
 * `ox`, `oy`는 유지한다. `out`과 `ray`가 같은 object여도 alias-safe하다.
 */
export function reverseInto<Out extends RayWritable>(out: Out, ray: Ray): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const { ox, oy, dx, dy } = ray;
  out.ox = ox;
  out.oy = oy;
  out.dx = -dx;
  out.dy = -dy;
  return out;
}
