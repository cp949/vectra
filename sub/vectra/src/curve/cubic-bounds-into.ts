import type { BoundsWritable, CubicCurve } from '../types/flat-shapes.internal';
import { solveQuadraticInOpenUnit } from './cubic-solve.internal';

/**
 * cubic Bezier curve의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * endpoints(t=0, t=1)와 interior extrema(t ∈ (0,1))에서의 점을 모두 고려하여
 * min/max를 계산한다.
 *
 * @param out 결과를 기록할 경계 상자 객체
 * @param curve 시작점·제어점·끝점 좌표를 담은 곡선 객체
 * @returns out
 */
export function cubicBoundsInto<Out extends BoundsWritable>(out: Out, curve: CubicCurve): Out {
  const p0x = curve.x0;
  const p0y = curve.y0;
  const p1x = curve.x1;
  const p1y = curve.y1;
  const p2x = curve.x2;
  const p2y = curve.y2;
  const p3x = curve.x3;
  const p3y = curve.y3;

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

  out.minX = minX;
  out.minY = minY;
  out.maxX = maxX;
  out.maxY = maxY;
  return out;
}
