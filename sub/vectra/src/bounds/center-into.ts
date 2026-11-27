import type { Bounds, PointWritable } from '../types/flat-shapes.internal';

/**
 * bounds의 중심점을 out에 기록하고 out을 반환한다.
 *
 * inverted bounds도 min/max의 산술 중점으로 계산한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 중심점을 기록할 점 객체
 * @param bounds 중심점을 계산할 bounds
 */
export function centerInto<Out extends PointWritable>(out: Out, bounds: Bounds): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  out.x = cx;
  out.y = cy;
  return out;
}
