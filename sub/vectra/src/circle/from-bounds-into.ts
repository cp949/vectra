import type { Bounds, CircleWritable } from '../types/flat-shapes.internal';

/**
 * bounds에 내접하는 circle을 out에 기록하고 out을 반환한다.
 *
 * radius는 min(width, height) / 2이다. empty bounds는 radius 0을 기록하고 center에 min corner를
 * 그대로 전파한다.
 *
 * @param out 결과를 기록할 원 객체
 * @param bounds 내접 circle을 계산할 bounds
 */
export function fromBoundsInto<Out extends CircleWritable>(out: Out, bounds: Bounds): Out {
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // empty bounds: sentinel 좌표 전파, radius = 0
  if (maxX < minX || maxY < minY) {
    out.cx = minX;
    out.cy = minY;
    out.r = 0;
    return out;
  }

  const w = maxX - minX;
  const h = maxY - minY;
  out.cx = minX + w * 0.5;
  out.cy = minY + h * 0.5;
  out.r = (w < h ? w : h) * 0.5;
  return out;
}
