import { lineFamilyBoxIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonContainsPoint, rectContainsPointXY } from '../internal/polygon';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { flattenPathInto } from '../path/flatten.internal';
import type { PathCommand, PathMeasurementOptions, RectLike } from '../types';

/**
 * rect와 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - path는 flatness 오차 범위 내에서 근사된다. edge 교차가 없고 containment fallback도 miss하면
 *   false를 반환할 수 있다.
 * - 판정 조건 (OR):
 *   1. flattened polyline의 임의 edge가 rect 경계와 교차한다.
 *   2. flattened polyline의 임의 점이 rect 내부(경계 포함)에 있다.
 *   3. rect의 임의 꼭짓점이 closed path 내부(경계 포함)에 있다.
 * - empty rect (width ≤ 0 또는 height ≤ 0): false.
 * - empty path (commands.length === 0): false.
 *
 * @param rect     교차를 검사할 rect
 * @param commands flatten할 path command sequence
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathRect(
  commands: readonly PathCommand[],
  rect: RectLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  if (rw <= 0 || rh <= 0) return false;
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  const x1 = rx + rw;
  const y1 = ry + rh;

  const hasClosed = commands.some((c) => c.kind === 'close');
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  const n = tmp.length;
  if (n === 0) return false;

  // path 점이 rect 내부에 있거나 edge가 rect 경계와 교차하면 true
  for (let i = 0; i < n; i++) {
    const px = tmp[i].x;
    const py = tmp[i].y;
    // 조건 2: path 점이 rect 내부
    if (rectContainsPointXY(rx, ry, rw, rh, px, py)) return true;
    // 조건 1: edge (i → i+1)가 rect 경계와 교차
    if (i < n - 1) {
      const qx = tmp[i + 1].x;
      const qy = tmp[i + 1].y;
      const seg = segmentToLineFamilyParam(px, py, qx, qy);
      if (lineFamilyBoxIntersects(seg, rx, ry, x1, y1, DEFAULT_EPSILON)) return true;
    }
  }

  // 조건 3: rect 꼭짓점이 closed path 내부에 있는지 (polygon containment)
  // CloseCommand가 있는 closed path에만 적용한다. open path는 면적을 정의하지 않으므로 제외한다.
  if (n >= 3 && hasClosed) {
    const corners: [number, number][] = [
      [rx, ry],
      [x1, ry],
      [x1, y1],
      [rx, y1],
    ];
    for (const [cx, cy] of corners) {
      if (polygonContainsPoint(tmp, cx, cy, DEFAULT_EPSILON)) return true;
    }
  }

  return false;
}
