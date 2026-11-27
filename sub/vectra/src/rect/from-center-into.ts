import type { RectWritable, Point } from '../types/flat-shapes.internal';

/**
 * center 좌표와 size로 rect를 구성하여 out에 기록하고 out을 반환한다.
 *
 * `out.x = center.x - size.x / 2`, `out.y = center.y - size.y / 2`,
 * `out.width = size.x`, `out.height = size.y` 공식을 그대로 기록한다.
 *
 * size가 홀수이거나 소수이면 x/y에 소수가 나올 수 있다. 정규화나 반올림은 하지 않는다.
 *
 * @param out rect를 기록할 사각형 객체
 * @param center rect의 center 좌표
 * @param size rect의 size (`x = width`, `y = height`)
 */
export function fromCenterInto<Out extends RectWritable>(out: Out, center: Point, size: Point): Out {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const w = size.x;
  const h = size.y;
  const cx = center.x;
  const cy = center.y;

  out.x = cx - w / 2;
  out.y = cy - h / 2;
  out.width = w;
  out.height = h;

  return out;
}
