import type { InfiniteLine, InfiniteLineWritable } from '../types/flat-shapes.internal';

/**
 * 같은 직선을 반대 방향으로 순회하도록 `direction`만 부호 반전해 `out`에 기록하고 `out`을 반환한다.
 *
 * `origin`은 유지한다. `out`과 `line`이 같은 object여도 alias-safe하다.
 */
export function reverseInto<Out extends InfiniteLineWritable>(out: Out, line: InfiniteLine): Out {
  // alias 호출에서도 안전하도록 모든 좌표를 먼저 읽는다
  const { ox, oy, dx, dy } = line;
  out.ox = ox;
  out.oy = oy;
  out.dx = -dx;
  out.dy = -dy;
  return out;
}
