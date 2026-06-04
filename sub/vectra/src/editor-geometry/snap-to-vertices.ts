import { distanceSqXY, readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import type { SnapResult } from './types';

/**
 * point에서 가장 가까운 vertex로 snap한다.
 *
 * tolerance 이내 vertex가 없으면 snapped: false를 반환한다. 동거리이면 insertion order 우선이다.
 *
 * @param point 기준 point
 * @param vertices snap 후보 vertex 배열
 * @param tolerance world 좌표 단위 최대 허용 거리
 */
export function snapPointToVertices(point: XYInput, vertices: XYInput[], tolerance: number): SnapResult {
  const px = readX(point);
  const py = readY(point);
  // tolerance가 양의 유한수가 아니면(0, 음수, NaN) 모두 miss. 음수가 제곱돼 false-hit가 되는 것을 막는다.
  if (!(tolerance > 0)) {
    return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  }
  const tolSq = tolerance * tolerance;
  let bestDistSq = tolSq;
  let bestX = px;
  let bestY = py;
  let found = false;

  for (const v of vertices) {
    const vx = readX(v);
    const vy = readY(v);
    const distSq = distanceSqXY(vx, vy, px, py);
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = vx;
      bestY = vy;
      found = true;
    }
  }

  if (!found) return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  return { snapped: true, x: bestX, y: bestY, distance: Math.sqrt(bestDistSq), source: 'vertex' };
}
