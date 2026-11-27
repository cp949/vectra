import type { BoundsWritable, Point } from '../types/flat-shapes.internal';

/**
 * points를 모두 포함하는 bounds를 out에 기록한다.
 *
 * 빈 points는 emptyInto와 같은 sentinel empty bounds를 기록한다. 단일 점 입력은 point bounds로
 * 기록한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param points bounds에 포함시킬 point 목록
 */
export function fromPointsInto<Out extends BoundsWritable>(out: Out, points: readonly Point[]): Out {
  if (points.length === 0) {
    out.minX = Infinity;
    out.minY = Infinity;
    out.maxX = -Infinity;
    out.maxY = -Infinity;
    return out;
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = minX;
  let maxY = minY;

  for (let i = 1; i < points.length; i++) {
    const px = points[i].x;
    const py = points[i].y;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
