/**
 * point에서 polygon obstacle list로 쏘는 visibility ray casting 계산용 internal helper.
 *
 * 각 obstacle vertex 방향과 그 양옆(`angleOffset`)으로 ray를 쏘고, 각 ray의 가장 가까운 hit만
 * 수집한다. line-family × polygon collection kernel(`lineFamilyPolygonIntersectionHits`)을
 * ray range로 재사용한다. renderer mask나 scene graph를 해석하지 않는다.
 *
 * 이 모듈은 internal 전용으로, public API에 노출되지 않는다.
 */

import type { PolygonLike } from '../types';
import { readPolygonPoints } from './polygon';
import { type LinePolygonHitRecord, lineFamilyPolygonIntersectionHits } from './polygon-line-intersections';
import { readX, readY } from './xy';

/** visibility ray helper의 기본 angle offset(radian). vertex 뒤 edge를 잡을 만큼 작은 양수다. */
export const DEFAULT_VISIBILITY_ANGLE_OFFSET = 1e-4;

/**
 * visibility ray hit 1건의 raw record.
 *
 * `angle`은 origin에서 hit point까지의 방향각(radian), `distance`는 Euclidean distance,
 * `polygonIndex`는 obstacle list index, `edgeIndex`는 그 polygon edge index다.
 */
export interface VisibilityRayHitRecord {
  /** hit point x 좌표 */
  x: number;

  /** hit point y 좌표 */
  y: number;

  /** origin에서 hit point까지의 방향각(radian) */
  angle: number;

  /** origin에서 hit point까지의 distance */
  distance: number;

  /** hit이 놓인 obstacle polygon list index */
  polygonIndex: number;

  /** hit이 놓인 polygon edge index */
  edgeIndex: number;
}

/**
 * origin (ox, oy)에서 polygon obstacle list로 쏜 visibility ray hit을 계산한다.
 *
 * 각 obstacle vertex angle마다 `angle - angleOffset`, `angle`, `angle + angleOffset` ray를 쏘고,
 * obstacle 전체에서 가장 가까운 hit(`distance > epsilon`)만 채택한다. 결과는 angle 오름차순이며,
 * 같은 angle과 같은 point는 dedupe된다.
 *
 * - origin과 같은 위치의 vertex(`distance <= epsilon`)는 ray sampling에서 제외한다.
 * - origin이 boundary 위인 경우 zero-distance hit(`distance <= epsilon`)은 결과에서 제외한다.
 * - empty obstacle list나 vertex 없는 입력은 빈 배열이다.
 *
 * `polygons` input은 readonly로 읽고 mutate하지 않는다.
 *
 * @param ox origin x
 * @param oy origin y
 * @param polygons obstacle polygon list
 * @param epsilon line/edge intersection과 dedupe 임계값
 * @param angleOffset vertex angle 양옆 추가 ray의 각 offset(radian)
 */
export function computeVisibilityRayHits(
  ox: number,
  oy: number,
  polygons: readonly PolygonLike[],
  epsilon: number,
  angleOffset: number
): VisibilityRayHitRecord[] {
  const out: VisibilityRayHitRecord[] = [];

  // 후보 ray angle 수집 (각 obstacle vertex 방향 ± offset)
  const angles: number[] = [];
  for (let pi = 0; pi < polygons.length; pi++) {
    const pts = readPolygonPoints(polygons[pi]);
    if (pts.length < 3) continue;
    for (let i = 0; i < pts.length; i++) {
      const vx = readX(pts[i]) - ox;
      const vy = readY(pts[i]) - oy;
      if (vx * vx + vy * vy <= epsilon * epsilon) continue;
      const a = Math.atan2(vy, vx);
      angles.push(a - angleOffset, a, a + angleOffset);
    }
  }

  const scratch: LinePolygonHitRecord[] = [];
  for (let ai = 0; ai < angles.length; ai++) {
    const a = angles[ai];
    const dx = Math.cos(a);
    const dy = Math.sin(a);

    let bestDist = Number.POSITIVE_INFINITY;
    let bestX = 0;
    let bestY = 0;
    let bestPolygon = -1;
    let bestEdge = -1;
    for (let pi = 0; pi < polygons.length; pi++) {
      // unit direction이므로 ray parameter tLine = Euclidean distance
      lineFamilyPolygonIntersectionHits(scratch, ox, oy, dx, dy, 'ray', polygons[pi], epsilon);
      for (let r = 0; r < scratch.length; r++) {
        const rec = scratch[r];
        // origin on boundary zero-distance hit 제외
        if (rec.tLine <= epsilon) continue;
        if (rec.tLine < bestDist) {
          bestDist = rec.tLine;
          bestX = rec.x;
          bestY = rec.y;
          bestPolygon = pi;
          bestEdge = rec.edgeIndex;
        }
        // records는 tLine 오름차순이라 첫 valid hit이 이 polygon의 최근접이다
        break;
      }
    }

    if (bestPolygon < 0) continue;
    out.push({
      x: bestX,
      y: bestY,
      angle: Math.atan2(bestY - oy, bestX - ox),
      distance: bestDist,
      polygonIndex: bestPolygon,
      edgeIndex: bestEdge,
    });
  }

  out.sort((p, q) => p.angle - q.angle);
  dedupeByAngleAndPoint(out, epsilon);
  return out;
}

/**
 * angle 오름차순으로 정렬된 hit list에서 같은 angle과 같은 point를 가리키는 인접 중복을 제거한다.
 *
 * 양옆 offset ray가 같은 vertex/point를 동시에 보고하는 경우를 하나로 합친다. 먼저 등장한 record를
 * 유지한다.
 */
function dedupeByAngleAndPoint(out: VisibilityRayHitRecord[], epsilon: number): void {
  const epsSq = epsilon * epsilon;
  let write = 0;
  for (let read = 0; read < out.length; read++) {
    const cur = out[read];
    if (write > 0) {
      const prev = out[write - 1];
      const ddx = cur.x - prev.x;
      const ddy = cur.y - prev.y;
      if (Math.abs(cur.angle - prev.angle) <= epsilon && ddx * ddx + ddy * ddy <= epsSq) continue;
    }
    out[write] = cur;
    write++;
  }
  out.length = write;
}
