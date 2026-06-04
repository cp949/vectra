import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * quadratic Bezier curve의 x/y 방향 extrema t 값을 반환한다.
 *
 * t ∈ (0, 1) 범위의 extrema t 값을 오름차순으로 담아 반환한다.
 * endpoint(t=0, t=1)는 제외한다.
 * degenerate curve(분모가 0인 경우)는 해당 축 extrema를 추가하지 않는다.
 *
 * x extrema: B'x(t) = 0 → t = (p0x - p1x) / (p0x - 2p1x + p2x)
 * y extrema: B'y(t) = 0 → t = (p0y - p1y) / (p0y - 2p1y + p2y)
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 */
export function quadraticExtrema(p0: XYInput, p1: XYInput, p2: XYInput): number[] {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const out: number[] = [];

  // x 방향 extrema: t = (p0x - p1x) / (p0x - 2*p1x + p2x)
  const denomX = p0x - 2 * p1x + p2x;
  if (denomX !== 0) {
    const tx = (p0x - p1x) / denomX;
    if (tx > 0 && tx < 1) {
      out.push(tx);
    }
  }

  // y 방향 extrema: t = (p0y - p1y) / (p0y - 2*p1y + p2y)
  const denomY = p0y - 2 * p1y + p2y;
  if (denomY !== 0) {
    const ty = (p0y - p1y) / denomY;
    if (ty > 0 && ty < 1) {
      out.push(ty);
    }
  }

  // 오름차순 정렬
  out.sort((a, b) => a - b);

  return out;
}
