import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyTriangleIntersects } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, TriangleLike } from '../types';

/**
 * triangle과 infinite-line이 교차하면 true를 반환한다.
 *
 * degenerate triangle (세 꼭짓점이 collinear, signed area 2× === 0): false.
 * infinite-line이 triangle 꼭짓점을 지나거나 변 위에 있으면 true.
 * direction이 zero-vector인 degenerate infinite-line은 점으로 환원해 triangle 변의 containment로 판정한다.
 *
 * @param triangle 세 꼭짓점으로 정의된 삼각형
 * @param infiniteLine 양방향 무한 직선
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsTriangleInfiniteLine(
  triangle: TriangleLike,
  infiniteLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const dir = readInfiniteLineDirection(infiniteLine);
  const lineParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersects(lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
