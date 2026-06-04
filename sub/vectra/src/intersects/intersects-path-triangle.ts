import { lineFamilyTriangleIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonContainsPoint } from '../internal/polygon';
import { readTriangleRawCoords } from '../internal/triangle';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathMeasurementOptions, TriangleLike } from '../types';

/**
 * triangle과 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - path는 flatness 오차 범위 내에서 근사된다. edge 교차가 없고 containment fallback도 miss하면
 *   false를 반환할 수 있다.
 * - 판정 조건 (OR):
 *   1. flattened polyline의 임의 edge가 triangle과 교차한다.
 *   2. flattened polyline의 임의 점이 triangle 내부(경계 포함)에 있다.
 *   3. triangle의 임의 꼭짓점이 closed path 내부(경계 포함)에 있다.
 * - degenerate triangle (signed area 2× === 0): false.
 * - empty path (commands.length === 0): false.
 *
 * @param triangle 교차를 검사할 triangle
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathTriangle(
  commands: readonly PathCommand[],
  triangle: TriangleLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  // degenerate triangle 체크
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area2 === 0) return false;

  const hasClosed = commands.some((c) => c.kind === 'close');
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  const n = tmp.length;
  if (n === 0) return false;

  // 점 (px, py)가 triangle 내부(경계 포함)에 있는지 barycentric cross-product로 판정한다.
  // signed area가 0이 아닌 경우에만 호출한다.
  function triangleContainsPointXY(px: number, py: number): boolean {
    const d1 = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
    const d2 = (px - bx) * (cy - by) - (py - by) * (cx - bx);
    const d3 = (px - cx) * (ay - cy) - (py - cy) * (ax - cx);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  // path 점이 triangle 내부에 있거나 edge가 triangle과 교차하면 true
  for (let i = 0; i < n; i++) {
    const px = tmp[i].x;
    const py = tmp[i].y;
    // 조건 2: path 점이 triangle 내부
    if (triangleContainsPointXY(px, py)) return true;
    // 조건 1: edge (i → i+1)가 triangle과 교차
    if (i < n - 1) {
      const qx = tmp[i + 1].x;
      const qy = tmp[i + 1].y;
      const seg = segmentToLineFamilyParam(px, py, qx, qy);
      if (lineFamilyTriangleIntersects(seg, ax, ay, bx, by, cx, cy, DEFAULT_EPSILON)) return true;
    }
  }

  // 조건 3: triangle 꼭짓점이 closed path 내부에 있는지 (polygon containment)
  // CloseCommand가 있는 closed path에만 적용한다. open path는 면적을 정의하지 않으므로 제외한다.
  if (n >= 3 && hasClosed) {
    if (polygonContainsPoint(tmp, ax, ay, DEFAULT_EPSILON)) return true;
    if (polygonContainsPoint(tmp, bx, by, DEFAULT_EPSILON)) return true;
    if (polygonContainsPoint(tmp, cx, cy, DEFAULT_EPSILON)) return true;
  }

  return false;
}
