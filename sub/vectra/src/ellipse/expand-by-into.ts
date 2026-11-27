import type { Ellipse, EllipseWritable } from '../types/flat-shapes.internal';

/**
 * ellipse를 각 반지름 방향으로 delta만큼 확장(또는 축소)한 결과를 out에 기록하고 out을 반환한다.
 *
 * rx += delta, ry += delta. center는 변경하지 않는다.
 * 결과 radius가 음수이면 0으로 clamp한다. 음수 delta 허용.
 *
 * @param out 확장 결과를 기록할 객체
 * @param ellipse 확장할 ellipse
 * @param delta 각 반지름에 더할 값 (음수 허용)
 */
export function expandByInto<Out extends EllipseWritable>(out: Out, ellipse: Ellipse, delta: number): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const cx = ellipse.cx;
  const cy = ellipse.cy;
  const rx = ellipse.rx;
  const ry = ellipse.ry;

  out.cx = cx;
  out.cy = cy;
  // 결과 radius가 음수이면 0으로 clamp한다
  out.rx = Math.max(0, rx + delta);
  out.ry = Math.max(0, ry + delta);
  return out;
}
