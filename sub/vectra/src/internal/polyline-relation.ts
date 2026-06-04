import type { PolylineLike } from '../types';
import { type LineFamilyParam, lineFamilyIntersects, segmentToLineFamilyParam } from './line-family';
import { readPolylinePoints } from './polyline';
import { readX, readY } from './xy';

/**
 * line-family와 polyline이 교차하면 true를 반환한다.
 *
 * polyline의 인접 segment를 순서대로 순회하며 lineFamilyIntersects를 호출한다.
 * points.length < 2이면 segment가 없으므로 false를 반환한다.
 * polyline은 open path이므로 마지막 point→첫 point edge는 검사하지 않는다.
 *
 * @param line     교차를 검사할 line-family parametric record
 * @param polyline segment 목록을 제공할 polyline input
 * @param epsilon  교차 판정 허용 오차
 */
export function lineFamilyPolylineIntersects(line: LineFamilyParam, polyline: PolylineLike, epsilon: number): boolean {
  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  if (n < 2) return false;
  for (let i = 0; i < n - 1; i++) {
    const ax = readX(pts[i]);
    const ay = readY(pts[i]);
    const bx = readX(pts[i + 1]);
    const by = readY(pts[i + 1]);
    const seg = segmentToLineFamilyParam(ax, ay, bx, by);
    if (lineFamilyIntersects(line, seg, epsilon)) return true;
  }
  return false;
}
