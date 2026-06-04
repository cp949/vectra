import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import type { GuideInput, SnapResult } from './types';

/**
 * point에서 가장 가까운 guide로 snap한다.
 *
 * guide는 axis-aligned 무한 직선이다. axis: 'x'는 x=value 수직선, axis: 'y'는 y=value 수평선이다.
 * tolerance 이내 guide가 없으면 snapped: false를 반환한다. 동거리이면 insertion order 우선이다.
 *
 * @param point 기준 point
 * @param guides snap 후보 guide 배열
 * @param tolerance world 좌표 단위 최대 허용 거리
 */
export function snapPointToGuides(point: XYInput, guides: GuideInput[], tolerance: number): SnapResult {
  const px = readX(point);
  const py = readY(point);
  let bestDist = tolerance;
  let bestX = px;
  let bestY = py;
  let found = false;

  for (const guide of guides) {
    const dist = guide.axis === 'x' ? Math.abs(px - guide.value) : Math.abs(py - guide.value);
    if (dist < bestDist) {
      bestDist = dist;
      bestX = guide.axis === 'x' ? guide.value : px;
      bestY = guide.axis === 'y' ? guide.value : py;
      found = true;
    }
  }

  if (!found) return { snapped: false, x: px, y: py, distance: Infinity, source: 'none' };
  return { snapped: true, x: bestX, y: bestY, distance: bestDist, source: 'guide' };
}
