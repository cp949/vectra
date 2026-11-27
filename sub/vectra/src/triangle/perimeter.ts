import type { Triangle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * triangle 세 변의 길이 합을 반환한다.
 *
 * vertex 순서에 관계없이 세 변 길이를 합산한다. degenerate triangle(collinear)에서도
 * 세 변의 거리 합을 그대로 반환한다. non-finite vertex는 IEEE 754 연산 결과를 전파한다.
 *
 * @param triangle 둘레를 계산할 triangle
 */
export function perimeter(triangle: Triangle): number {
  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;
  return hypot2(bx - ax, by - ay) + hypot2(cx - bx, cy - by) + hypot2(ax - cx, ay - cy);
}
