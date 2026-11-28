import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersects } from '../internal/line-family';
import type { InfiniteLine, Triangle } from '../types/flat-shapes.internal';

/**
 * triangle과 infinite-line이 교차하면 true를 반환한다.
 *
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * infinite-line이 triangle 꼭짓점을 지나거나 변 위에 있으면 true.
 * `dx = dy = 0`인 degenerate infinite-line은 점으로 환원해 triangle 변의 containment로 판정한다.
 *
 * @param triangle 세 꼭짓점으로 정의된 삼각형
 * @param infiniteLine 양방향 무한 직선
 * @param epsilon 평행 판정 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function intersectsTriangleInfiniteLine(
  triangle: Triangle,
  infiniteLine: InfiniteLine,
  epsilon?: number
): boolean {
  const lineParam = infiniteLineToLineFamilyParam(infiniteLine.ox, infiniteLine.oy, infiniteLine.dx, infiniteLine.dy);
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return lineFamilyTriangleIntersects(lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
