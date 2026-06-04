import { readX, readY } from '../internal/xy';
import type { BoundsWritable, XYInput } from '../types';

/**
 * quadratic Bezier curve의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여
 * min/max를 계산한다.
 *
 * @param out bounds를 기록할 BoundsWritable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 */
export function quadraticBoundsInto<Out extends BoundsWritable>(out: Out, p0: XYInput, p1: XYInput, p2: XYInput): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

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

  // BoundsWritable의 min/max는 XYWritable이므로 분기해서 기록
  const minOut = out.min;
  const maxOut = out.max;

  if (Array.isArray(minOut)) {
    minOut[0] = minX;
    minOut[1] = minY;
  } else {
    (minOut as { x: number; y: number }).x = minX;
    (minOut as { x: number; y: number }).y = minY;
  }

  if (Array.isArray(maxOut)) {
    maxOut[0] = maxX;
    maxOut[1] = maxY;
  } else {
    (maxOut as { x: number; y: number }).x = maxX;
    (maxOut as { x: number; y: number }).y = maxY;
  }

  return out;
}
