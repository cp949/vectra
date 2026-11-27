import type { BoundsWritable, Point } from '../types/flat-shapes.internal';

/**
 * center와 size로 정의하는 bounds를 out에 기록한다.
 *
 * min = center - size / 2, max = center + size / 2.
 * size.x/size.y를 width/height로 해석한다. 음수 size는 정규화하지 않는다.
 * 결과가 inverted이면 empty bounds가 된다.
 *
 * out이 center 또는 size와 alias되어도 안전하다.
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param center bounds 중심 좌표
 * @param size bounds의 width/height를 담은 Point (x=width, y=height)
 */
export function fromCenterInto<Out extends BoundsWritable>(out: Out, center: Point, size: Point): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = center.x;
  const cy = center.y;
  const hw = size.x / 2;
  const hh = size.y / 2;
  out.minX = cx - hw;
  out.minY = cy - hh;
  out.maxX = cx + hw;
  out.maxY = cy + hh;
  return out;
}
