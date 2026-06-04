import { DEFAULT_EPSILON } from '../internal/numeric';
import { hasNonFiniteVertex, readTriangleRawCoords, triangleSignedArea2x } from '../internal/triangle';
import type { TriangleLike, XYObjectWritable } from '../types';
import { segmentSegmentDetailXY } from './segment-segment-detail.internal';

interface LocalHit {
  x: number;
  y: number;
  tA: number;
}

/**
 * 두 triangle boundary의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle `a`의 3개 edge를 순회하며 각 edge와 triangle `b`의 3개 edge를 `segmentSegmentDetail`로
 * 교차시켜 boundary 교점을 모은다. boundary 교점만 점으로 노출하므로, 한 triangle이 다른 triangle을
 * 완전히 포함해 boundary 교점이 없으면 빈 배열이다.
 * - transversal edge crossing은 교점 1점, shared vertex/edge endpoint 중복은 dedupe된 1점이다.
 * - shared edge collinear overlap은 start/end 두 점을 노출한다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex는 `intersectsTriangleTriangle`처럼
 *   빈 배열로 둔다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 vertex object를 재사용하지 않는다. 반환 순서는 triangle `a` boundary traversal 순서(edge index,
 * 그 안에서 edge parameter `tA`)다.
 * `epsilon`은 평행/거리/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param a 첫 번째 triangle. point ordering의 기준이다.
 * @param b 두 번째 triangle
 * @param epsilon 평행/거리/dedupe 판정 임계값
 */
export function triangleTriangleIntersectionsInto(
  outPoints: XYObjectWritable[],
  a: TriangleLike,
  b: TriangleLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  outPoints.length = 0;
  if (hasNonFiniteVertex(a) || triangleSignedArea2x(a) === 0) return outPoints;
  if (hasNonFiniteVertex(b) || triangleSignedArea2x(b) === 0) return outPoints;

  const A = readTriangleRawCoords(a);
  const B = readTriangleRawCoords(b);
  const aEdges: readonly [number, number, number, number][] = [
    [A.ax, A.ay, A.bx, A.by],
    [A.bx, A.by, A.cx, A.cy],
    [A.cx, A.cy, A.ax, A.ay],
  ];
  const bEdges: readonly [number, number, number, number][] = [
    [B.ax, B.ay, B.bx, B.by],
    [B.bx, B.by, B.cx, B.cy],
    [B.cx, B.cy, B.ax, B.ay],
  ];

  const epsSq = epsilon * epsilon;
  for (let i = 0; i < aEdges.length; i++) {
    const ae = aEdges[i];
    const local: LocalHit[] = [];
    for (let j = 0; j < bEdges.length; j++) {
      const be = bEdges[j];
      const detail = segmentSegmentDetailXY(ae[0], ae[1], ae[2], ae[3], be[0], be[1], be[2], be[3], epsilon);
      if (detail.kind === 'point') {
        local.push({ x: detail.point.x, y: detail.point.y, tA: detail.tA });
      } else if (detail.kind === 'overlap') {
        local.push({ x: detail.start.x, y: detail.start.y, tA: detail.tA[0] });
        local.push({ x: detail.end.x, y: detail.end.y, tA: detail.tA[1] });
      }
    }
    // 같은 A edge 안에서는 edge parameter tA 오름차순으로 정렬한다.
    local.sort((p, q) => p.tA - q.tA);
    for (let k = 0; k < local.length; k++) {
      if (!hasNearbyPoint(outPoints, local[k].x, local[k].y, epsSq)) {
        outPoints.push({ x: local[k].x, y: local[k].y });
      }
    }
  }

  return outPoints;
}

/** 이미 수집한 point 중 (px, py)와 epsilon² 이내가 있으면 true. */
function hasNearbyPoint(points: readonly XYObjectWritable[], px: number, py: number, epsSq: number): boolean {
  for (let i = 0; i < points.length; i++) {
    const ddx = points[i].x - px;
    const ddy = points[i].y - py;
    if (ddx * ddx + ddy * ddy <= epsSq) return true;
  }
  return false;
}
