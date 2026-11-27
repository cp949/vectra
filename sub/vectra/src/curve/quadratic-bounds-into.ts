import type { BoundsWritable, QuadraticCurve } from '../types/flat-shapes.internal';

/**
 * quadratic Bezier curve의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여
 * min/max를 계산한다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 */
export function quadraticBoundsInto<Out extends BoundsWritable>(out: Out, curve: QuadraticCurve): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;

  // endpoints로 초기 min/max 결정
  let minX = Math.min(p0x, p2x);
  let maxX = Math.max(p0x, p2x);
  let minY = Math.min(p0y, p2y);
  let maxY = Math.max(p0y, p2y);

  // x 방향 extrema
  const denomX = p0x - 2 * p1x + p2x;
  if (denomX !== 0) {
    const tx = (p0x - p1x) / denomX;
    if (tx > 0 && tx < 1) {
      // B(tx)의 x 좌표 계산
      const mt = 1 - tx;
      const px = mt * mt * p0x + 2 * mt * tx * p1x + tx * tx * p2x;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
    }
  }

  // y 방향 extrema
  const denomY = p0y - 2 * p1y + p2y;
  if (denomY !== 0) {
    const ty = (p0y - p1y) / denomY;
    if (ty > 0 && ty < 1) {
      // B(ty)의 y 좌표 계산
      const mt = 1 - ty;
      const py = mt * mt * p0y + 2 * mt * ty * p1y + ty * ty * p2y;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }

  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
