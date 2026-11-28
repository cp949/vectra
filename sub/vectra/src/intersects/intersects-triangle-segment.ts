import { lineFamilyTriangleIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import type { Segment, Triangle } from '../types/flat-shapes.internal';

/**
 * triangle과 segment가 교차하면 true를 반환한다.
 *
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * segment가 triangle 내부에 완전히 포함된 경우도 true를 반환한다.
 * zero-length segment는 점으로 환원해 triangle 변의 containment로 판정한다.
 *
 * @param triangle 세 꼭짓점으로 정의된 삼각형
 * @param line 두 끝점으로 정의된 유한 선분
 * @param epsilon 평행 판정 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsTriangleSegment(triangle: Triangle, line: Segment, epsilon?: number): boolean {
  const lineParam = segmentToLineFamilyParam(line.x1, line.y1, line.x2, line.y2);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return lineFamilyTriangleIntersects(lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
