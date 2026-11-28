import type { Polyline } from '../types/flat-shapes.internal';
import { type LineFamilyParam, lineFamilyIntersects, segmentToLineFamilyParam } from './line-family';

/**
 * line-family와 polyline이 교차하면 true를 반환한다.
 *
 * polyline의 인접 segment를 순서대로 순회하며 lineFamilyIntersects를 호출한다.
 * pts.length < 2이면 segment가 없으므로 false를 반환한다.
 * polyline은 open path이므로 마지막 point→첫 point edge는 검사하지 않는다.
 *
 * @param line     교차를 검사할 line-family parametric record
 * @param pts segment 목록을 제공할 polyline input
 * @param epsilon  교차 판정 허용 오차. 생략하면 평행 판정이 scale 불변(`sin θ`)이다
 */
export function lineFamilyPolylineIntersects(
  line: LineFamilyParam,
  pts: Polyline,
  epsilon: number | undefined
): boolean {
  const n = pts.length;
  if (n < 2) return false;
  for (let i = 0; i < n - 1; i++) {
    const ax = pts[i].x;
    const ay = pts[i].y;
    const bx = pts[i + 1].x;
    const by = pts[i + 1].y;
    const seg = segmentToLineFamilyParam(ax, ay, bx, by);
    if (lineFamilyIntersects(line, seg, epsilon)) return true;
  }
  return false;
}
