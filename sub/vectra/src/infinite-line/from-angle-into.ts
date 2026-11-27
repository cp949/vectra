import type { InfiniteLineWritable, Point } from '../types/flat-shapes.internal';

/**
 * `origin`을 기준점으로, radian `angle` 방향 단위 벡터를 direction으로 `out`에 기록하고 `out`을 반환한다.
 *
 * `dx = Math.cos(angle)`, `dy = Math.sin(angle)`이다.
 *
 * `angle = NaN | Infinity | -Infinity` 같은 non-finite 입력은 검증하지 않는다.
 * `Math.cos`/`Math.sin`의 산술 결과(`Math.cos(Infinity) === NaN` 등)가 direction component에 그대로 기록된다.
 *
 * @param out 결과를 기록할 무한 직선 객체
 * @param origin infinite-line 기준점으로 복사할 좌표
 * @param angle direction 단위 벡터의 radian angle
 */
export function fromAngleInto<Out extends InfiniteLineWritable>(out: Out, origin: Point, angle: number): Out {
  const ox = origin.x;
  const oy = origin.y;
  out.ox = ox;
  out.oy = oy;
  out.dx = Math.cos(angle);
  out.dy = Math.sin(angle);
  return out;
}
