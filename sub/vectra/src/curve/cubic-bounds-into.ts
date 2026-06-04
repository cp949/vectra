import { readX, readY } from '../internal/xy';
import type { BoundsWritable, XYInput } from '../types';
import { solveQuadraticInOpenUnit } from './cubic-solve.internal';

/**
 * cubic Bezier curve의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여
 * min/max를 계산한다.
 *
 * @param out bounds를 기록할 BoundsWritable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @returns out
 */
export function cubicBoundsInto<Out extends BoundsWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput
): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  // endpoints로 초기 min/max 결정
  let minX = Math.min(p0x, p3x);
  let maxX = Math.max(p0x, p3x);
  let minY = Math.min(p0y, p3y);
  let maxY = Math.max(p0y, p3y);

  // x 방향 extrema 계산을 위한 quadratic 계수
  const ax = -p0x + 3 * p1x - 3 * p2x + p3x;
  const bx = 2 * (p0x - 2 * p1x + p2x);
  const cx = -p0x + p1x;

  const xRoots: number[] = [];
  solveQuadraticInOpenUnit(xRoots, ax, bx, cx);

  for (const tx of xRoots) {
    const mt = 1 - tx;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = tx * tx;
    const t3 = t2 * tx;
    const px = mt3 * p0x + 3 * mt2 * tx * p1x + 3 * mt * t2 * p2x + t3 * p3x;
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
  }

  // y 방향 extrema 계산을 위한 quadratic 계수
  const ay = -p0y + 3 * p1y - 3 * p2y + p3y;
  const by = 2 * (p0y - 2 * p1y + p2y);
  const cy = -p0y + p1y;

  const yRoots: number[] = [];
  solveQuadraticInOpenUnit(yRoots, ay, by, cy);

  for (const ty of yRoots) {
    const mt = 1 - ty;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = ty * ty;
    const t3 = t2 * ty;
    const py = mt3 * p0y + 3 * mt2 * ty * p1y + 3 * mt * t2 * p2y + t3 * p3y;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
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
