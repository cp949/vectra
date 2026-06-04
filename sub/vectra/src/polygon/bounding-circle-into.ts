import { readPolygonPoints } from '../internal/polygon';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleWritable, PolygonLike, XYWritable } from '../types';

/**
 * polygon을 감싸는 approximate enclosing circle을 out에 기록하고 out을 반환한다.
 *
 * Ritter algorithm 기반 근사 최소 외접원.
 * empty polygon(pointCount === 0): center = (0, 0), radius = 0을 기록한다.
 * out.center object reference를 mutation하고 out.radius를 기록한다.
 *
 * @param out circle을 기록할 writable output
 * @param polygon 외접원을 계산할 polygon
 */
export function boundingCircleInto<Out extends CircleWritable<XYWritable>>(out: Out, polygon: PolygonLike): Out {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;

  if (n === 0) {
    writeXY(out.center, 0, 0);
    out.radius = 0;
    return out;
  }

  // AABB center를 초기 center로 사용
  let minX = readX(pts[0]);
  let minY = readY(pts[0]);
  let maxX = minX;
  let maxY = minY;
  for (let i = 1; i < n; i++) {
    const px = readX(pts[i]);
    const py = readY(pts[i]);
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }

  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;

  // 가장 먼 점 찾기
  let maxDistSq = 0;
  let farthestIdx = 0;
  for (let i = 0; i < n; i++) {
    const dx = readX(pts[i]) - cx;
    const dy = readY(pts[i]) - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistSq) {
      maxDistSq = distSq;
      farthestIdx = i;
    }
  }

  // 가장 먼 점으로 center 이동, radius 설정
  cx = readX(pts[farthestIdx]);
  cy = readY(pts[farthestIdx]);
  let r = 0;

  // 나머지 점들을 순회하며 원 밖의 점이 있으면 확장
  for (let i = 0; i < n; i++) {
    const px = readX(pts[i]);
    const py = readY(pts[i]);
    const dx = px - cx;
    const dy = py - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > r) {
      // center를 점 방향으로 이동하고 radius 확장
      const newR = (r + dist) / 2;
      const ratio = (dist - newR) / dist;
      cx = cx + dx * ratio;
      cy = cy + dy * ratio;
      r = newR;
    }
  }

  writeXY(out.center, cx, cy);
  out.radius = r;
  return out;
}
