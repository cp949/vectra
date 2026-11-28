import type { Polygon, Polyline } from '../types/flat-shapes.internal';
import { polygonContainsPoint, segmentsIntersect } from './polygon';

/**
 * polygon과 polyline이 교차하면 true를 반환한다.
 *
 * 판정 순서:
 * 1. 모든 polyline point가 polygon 내부(boundary 포함)에 있으면 true.
 * 2. polyline segment와 polygon edge가 교차(collinear overlap 포함)하면 true.
 *
 * empty polygon(좌표 수 < 6) 또는 empty polyline(pts_line.length === 0)은 false.
 * single-point polyline(pts_line.length === 1)은 point containment만 판정한다.
 * polygon이 polyline path에 둘러싸이는 경우(polyline이 open path이고 polygon vertex가 polyline 내부에 없음)는
 * false를 반환한다. polyline은 open path이므로 면적을 정의하지 않는다.
 * epsilon은 containment 판정에만 적용된다. segment crossing 판정(segmentsIntersect)은 epsilon 없이
 * exact 교차 검사를 수행한다.
 */
export function polygonPolylineIntersects(ptsPoly: Polygon, ptsLine: Polyline, epsilon: number): boolean {
  const nPoly = ptsPoly.length;
  const nLine = ptsLine.length;

  if (nPoly < 6 || nLine === 0) return false;

  // single-point polyline은 point containment만 판정한다.
  if (nLine === 1) {
    return polygonContainsPoint(ptsPoly, ptsLine[0].x, ptsLine[0].y, epsilon);
  }

  // polyline point가 polygon 내부에 있으면 true (완전 포함 케이스 포함)
  for (let i = 0; i < nLine; i++) {
    if (polygonContainsPoint(ptsPoly, ptsLine[i].x, ptsLine[i].y, epsilon)) return true;
  }

  // polyline segment와 polygon edge crossing 확인
  for (let i = 0; i < nLine - 1; i++) {
    const ax = ptsLine[i].x;
    const ay = ptsLine[i].y;
    const bx = ptsLine[i + 1].x;
    const by = ptsLine[i + 1].y;
    for (let j = 0; j < nPoly; j += 2) {
      const k = (j + 2) % nPoly;
      const eax = ptsPoly[j];
      const eay = ptsPoly[j + 1];
      const ebx = ptsPoly[k];
      const eby = ptsPoly[k + 1];
      if (segmentsIntersect(ax, ay, bx, by, eax, eay, ebx, eby)) return true;
    }
  }

  return false;
}

/**
 * 두 polygon이 교차(영역 접촉/중첩)하면 true를 반환한다.
 *
 * lightweight area relation helper다. polygon clipping/boolean operation/topology repair를 하지
 * 않는다. 판정 순서 (OR):
 * 1. polygon A의 edge와 polygon B의 edge가 교차(endpoint touch, collinear overlap 포함)하면 true.
 * 2. polygon A의 첫 vertex가 polygon B 내부(boundary 포함)에 있으면 true(A ⊆ B containment).
 * 3. polygon B의 첫 vertex가 polygon A 내부(boundary 포함)에 있으면 true(B ⊆ A containment).
 *
 * edge 교차가 없으면 simple polygon 기준으로 두 polygon은 전체 포함 또는 완전 분리 중 하나이므로
 * 대표 vertex containment만으로 충분하다. self-intersecting polygon은 repair하지 않고 기존
 * `polygonContainsPoint`/`segmentsIntersect` 정책을 그대로 따른다.
 *
 * empty polygon(좌표 수 < 6)은 false다. epsilon은 containment/boundary 판정에만 쓰고 finite
 * validation을 완화하지 않는다. segment crossing(`segmentsIntersect`)은 epsilon 없는 exact 검사다.
 *
 * @param ptsA 첫 번째 polygon
 * @param ptsB 두 번째 polygon
 * @param epsilon containment/boundary 판정 임계값
 */
export function polygonPolygonIntersects(ptsA: Polygon, ptsB: Polygon, epsilon: number): boolean {
  const nA = ptsA.length;
  const nB = ptsB.length;
  if (nA < 6 || nB < 6) return false;

  // edge crossing 확인
  for (let i = 0; i < nA; i += 2) {
    const i2 = (i + 2) % nA;
    const ax = ptsA[i];
    const ay = ptsA[i + 1];
    const bx = ptsA[i2];
    const by = ptsA[i2 + 1];
    for (let j = 0; j < nB; j += 2) {
      const j2 = (j + 2) % nB;
      if (segmentsIntersect(ax, ay, bx, by, ptsB[j], ptsB[j + 1], ptsB[j2], ptsB[j2 + 1])) {
        return true;
      }
    }
  }

  // edge 교차 없음: 대표 vertex containment로 전체 포함/분리를 가른다
  if (polygonContainsPoint(ptsB, ptsA[0], ptsA[1], epsilon)) return true;
  if (polygonContainsPoint(ptsA, ptsB[0], ptsB[1], epsilon)) return true;
  return false;
}
