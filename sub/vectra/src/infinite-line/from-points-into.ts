import type { InfiniteLineWritable, Point } from '../types/flat-shapes.internal';

/**
 * 두 point `a`, `b`를 지나는 supporting line을 `out`에 기록하고 `out`을 반환한다.
 *
 * `origin = a`, `direction = b - a`로 기록한다.
 * `a`와 `b`가 같으면 degenerate infinite-line(`direction = (0, 0)`)이 된다.
 *
 * non-finite point component는 검증하지 않는다. `b - a`의 산술 결과가 direction에 그대로 기록된다.
 *
 * @param out 결과를 기록할 무한 직선 객체
 * @param a 직선이 지나는 첫 point. `origin`으로 복사된다
 * @param b 직선이 지나는 둘째 point. `direction = b - a`로 사용된다
 */
export function fromPointsInto<Out extends InfiniteLineWritable>(out: Out, a: Point, b: Point): Out {
  const ax = a.x;
  const ay = a.y;
  const bx = b.x;
  const by = b.y;
  out.ox = ax;
  out.oy = ay;
  out.dx = bx - ax;
  out.dy = by - ay;
  return out;
}
