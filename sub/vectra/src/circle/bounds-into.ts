import type { BoundsWritable, Circle } from '../types/flat-shapes.internal';

/**
 * circle을 포함하는 axis-aligned bounds를 out에 기록하고 out을 반환한다.
 *
 * radius <= 0인 empty circle은 sentinel empty bounds를 기록한다. input과 out이 같은 object여도
 * 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param circle bounds로 변환할 circle
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, circle: Circle): Out {
  const cx = circle.cx;
  const cy = circle.cy;
  const r = circle.r;

  if (r <= 0) {
    // empty circle: sentinel empty bounds
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  out.minX = cx - r;
  out.minY = cy - r;
  out.maxX = cx + r;
  out.maxY = cy + r;
  return out;
}
