import { polygonContainsPoint } from '../internal/polygon';
import type { Triangle, Point } from '../types/flat-shapes.internal';

/**
 * point가 triangle 내부 또는 경계(edge/vertex) 위에 있으면 true를 반환한다.
 *
 * - closed boundary 정책: edge 또는 vertex 위의 point는 true로 판정한다.
 * - degenerate triangle(collinear, epsilon=0 기준 signed area 2x === 0)이면 false를 반환한다.
 * - non-degenerate triangle은 내부적으로 `polygonContainsPoint`를 재사용한다.
 *
 * @param triangle 판정 대상 triangle
 * @param point 판정할 point
 * @param epsilon boundary proximity threshold (기본값 0)
 * @returns point가 triangle 내부/경계에 있으면 true
 */
export function containsPoint(triangle: Triangle, point: Point, epsilon = 0): boolean {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  // degenerate triangle(area === 0)은 항상 false
  if ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax) === 0) {
    return false;
  }
  const px = point.x;
  const py = point.y;
  // 이미 추출한 좌표로 plain object 구성해 polygon 판정에 재사용
  return polygonContainsPoint(
    [
      { x: ax, y: ay },
      { x: bx, y: by },
      { x: cx, y: cy },
    ],
    px,
    py,
    epsilon
  );
}
