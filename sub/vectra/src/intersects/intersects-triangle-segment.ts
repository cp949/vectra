import { lineFamilyTriangleIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, TriangleLike } from '../types';

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
 */
export function intersectsTriangleSegment(
  triangle: TriangleLike,
  line: SegmentLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return lineFamilyTriangleIntersects(lineParam, ax, ay, bx, by, cx, cy, epsilon);
}
