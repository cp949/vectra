import type { InfiniteLineWritable, Point } from '../types/flat-shapes.internal';

/**
 * `origin`을 기준점으로, `normal`에 수직인 direction을 `out`에 기록하고 `out`을 반환한다.
 *
 * `{ dx: -normal.y, dy: normal.x }`로 기록한다 (y-up 수학 관례에서 normal을 좌측으로 90도 회전).
 * `normal`은 normalize하지 않는다. caller가 unit normal을 전달하지 않으면 direction도 같은 scale을 가진다.
 *
 * zero normal(`{ x: 0, y: 0 }`)은 degenerate direction(`{ x: 0, y: 0 }`)을 기록한다.
 *
 * non-finite normal component는 검증하지 않고 산술 결과를 그대로 direction에 기록한다.
 *
 * @param out 결과를 기록할 무한 직선 객체
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param normal 직선에 수직인 normal vector. normalize되어 있을 필요는 없다
 */
export function fromNormalInto<Out extends InfiniteLineWritable>(out: Out, origin: Point, normal: Point): Out {
  const ox = origin.x;
  const oy = origin.y;
  const nx = normal.x;
  const ny = normal.y;
  out.ox = ox;
  out.oy = oy;
  out.dx = -ny;
  out.dy = nx;
  return out;
}
