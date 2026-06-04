import type { PolygonLike, PolylineLike } from '../types';
import { type LineFamilyParam, lineFamilyIntersects, segmentToLineFamilyParam } from './line-family';
import { polygonContainsPoint, readPolygonPoints, segmentsIntersect } from './polygon';
import { readPolylinePoints } from './polyline';
import { readX, readY } from './xy';

/**
 * line-family와 polygon이 교차하면 true를 반환한다.
 *
 * polygon의 모든 edge를 segment로 순회해 line-family와 교차하는지 확인한다.
 * edge 교차가 없고 segment인 경우 origin이 polygon 내부에 있으면 true(완전 포함).
 * pts.length < 3이면 empty polygon으로 false를 반환한다.
 */
export function lineFamilyPolygonIntersects(line: LineFamilyParam, polygon: PolygonLike, epsilon: number): boolean {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  if (n < 3) return false;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[j]);
    const by = readY(pts[j]);
    if (lineFamilyIntersects(line, segmentToLineFamilyParam(ax, ay, bx, by), epsilon)) return true;
  }

  // segment가 polygon 내부에 완전히 포함된 경우: edge 교차 없이도 true
  if (line.kind !== 'finite') return false;
  return polygonContainsPoint(pts, line.ox, line.oy, epsilon);
}

/**
 * polygon과 polyline이 교차하면 true를 반환한다.
 *
 * 판정 순서:
 * 1. 모든 polyline point가 polygon 내부(boundary 포함)에 있으면 true.
 * 2. polyline segment와 polygon edge가 교차(collinear overlap 포함)하면 true.
 *
 * empty polygon(pts_poly.length < 3) 또는 empty polyline(pts_line.length === 0)은 false.
 * single-point polyline(pts_line.length === 1)은 point containment만 판정한다.
 * polygon이 polyline path에 둘러싸이는 경우(polyline이 open path이고 polygon vertex가 polyline 내부에 없음)는
 * false를 반환한다. polyline은 open path이므로 면적을 정의하지 않는다.
 * epsilon은 containment 판정에만 적용된다. segment crossing 판정(segmentsIntersect)은 epsilon 없이
 * exact 교차 검사를 수행한다.
 */
export function polygonPolylineIntersects(polygon: PolygonLike, polyline: PolylineLike, epsilon: number): boolean {
  const ptsPoly = readPolygonPoints(polygon);
  const ptsLine = readPolylinePoints(polyline);
  const nPoly = ptsPoly.length;
  const nLine = ptsLine.length;

  if (nPoly < 3 || nLine === 0) return false;

  // single-point polyline은 point containment만 판정한다.
  if (nLine === 1) {
    return polygonContainsPoint(ptsPoly, readX(ptsLine[0]), readY(ptsLine[0]), epsilon);
  }

  // polyline point가 polygon 내부에 있으면 true (완전 포함 케이스 포함)
  for (let i = 0; i < nLine; i++) {
    if (polygonContainsPoint(ptsPoly, readX(ptsLine[i]), readY(ptsLine[i]), epsilon)) return true;
  }

  // polyline segment와 polygon edge crossing 확인
  for (let i = 0; i < nLine - 1; i++) {
    const ax = readX(ptsLine[i]);
    const ay = readY(ptsLine[i]);
    const bx = readX(ptsLine[i + 1]);
    const by = readY(ptsLine[i + 1]);
    for (let j = 0; j < nPoly; j++) {
      const k = (j + 1) % nPoly;
      const eax = readX(ptsPoly[j]);
      const eay = readY(ptsPoly[j]);
      const ebx = readX(ptsPoly[k]);
      const eby = readY(ptsPoly[k]);
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
 * empty polygon(points.length < 3)은 false다. epsilon은 containment/boundary 판정에만 쓰고 finite
 * validation을 완화하지 않는다. segment crossing(`segmentsIntersect`)은 epsilon 없는 exact 검사다.
 *
 * @param a 첫 번째 polygon
 * @param b 두 번째 polygon
 * @param epsilon containment/boundary 판정 임계값
 */
export function polygonPolygonIntersects(a: PolygonLike, b: PolygonLike, epsilon: number): boolean {
  const ptsA = readPolygonPoints(a);
  const ptsB = readPolygonPoints(b);
  const nA = ptsA.length;
  const nB = ptsB.length;
  if (nA < 3 || nB < 3) return false;

  // edge crossing 확인
  for (let i = 0; i < nA; i++) {
    const i2 = (i + 1) % nA;
    const ax = readX(ptsA[i]);
    const ay = readY(ptsA[i]);
    const bx = readX(ptsA[i2]);
    const by = readY(ptsA[i2]);
    for (let j = 0; j < nB; j++) {
      const j2 = (j + 1) % nB;
      if (segmentsIntersect(ax, ay, bx, by, readX(ptsB[j]), readY(ptsB[j]), readX(ptsB[j2]), readY(ptsB[j2]))) {
        return true;
      }
    }
  }

  // edge 교차 없음: 대표 vertex containment로 전체 포함/분리를 가른다
  if (polygonContainsPoint(ptsB, readX(ptsA[0]), readY(ptsA[0]), epsilon)) return true;
  if (polygonContainsPoint(ptsA, readX(ptsB[0]), readY(ptsB[0]), epsilon)) return true;
  return false;
}
