import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsWritable, XYInput } from '../types';

/**
 * points를 모두 포함하는 bounds를 out에 기록한다.
 *
 * 빈 points는 emptyInto와 같은 sentinel empty bounds를 기록한다. 단일 점 입력은 point bounds로
 * 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out points의 extent를 기록할 writable output
 * @param points bounds에 포함시킬 point 목록
 */
export function fromPointsInto<Out extends BoundsWritable>(out: Out, points: readonly XYInput[]): Out {
  if (points.length === 0) {
    // 빈 입력은 sentinel bounds를 기록한다
    writeXY(out.min, Infinity, Infinity);
    writeXY(out.max, -Infinity, -Infinity);
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

  writeXY(out.min, minX, minY);
  writeXY(out.max, maxX, maxY);
  return out;
}
