import { readX, readY } from '../internal/xy';
import type { RectWritable, XYInput } from '../types';

/**
 * points를 모두 포함하는 rect를 out에 기록한다.
 *
 * 빈 배열은 `(0, 0, 0, 0)`을 기록한다.
 * 단일 점 입력은 width/height가 0인 degenerate rect를 기록한다.
 *
 * @param out 계산된 rect를 기록할 writable output
 * @param points 포함할 point 배열
 */
export function fromPointsInto<Out extends RectWritable>(out: Out, points: readonly XYInput[]): Out {
  if (points.length === 0) {
    // 빈 입력은 (0, 0, 0, 0)을 기록한다
    out.x = 0;
    out.y = 0;
    out.width = 0;
    out.height = 0;
    return out;
  }

  let minX = readX(points[0]);
  let minY = readY(points[0]);
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < points.length; i++) {
    const px = readX(points[i]);
    const py = readY(points[i]);
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return out;
}
