import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike } from '../types';

/**
 * triangle 세 변의 길이 합을 반환한다.
 *
 * vertex 순서에 관계없이 세 변 길이를 합산한다. degenerate triangle(collinear)에서도
 * 세 변의 거리 합을 그대로 반환한다. non-finite vertex는 IEEE 754 연산 결과를 전파한다.
 *
 * @param triangle 둘레를 계산할 triangle
 */
export function perimeter(triangle: TriangleLike): number {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return Math.hypot(bx - ax, by - ay) + Math.hypot(cx - bx, cy - by) + Math.hypot(ax - cx, ay - cy);
}
