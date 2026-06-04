import { readEllipseCenter, readEllipseRadiusX, readEllipseRadiusY } from '../internal/ellipse';
import { lineFamilyEllipseIntersects } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { polygonContainsPoint } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import { flattenPathInto } from '../path/flatten.internal';
import type { EllipseLike, PathCommand, PathMeasurementOptions } from '../types';
import { allFinite } from './curve-primitive-relation.internal';

/**
 * ellipse와 path가 교차하면 true를 반환한다.
 *
 * - path를 polyline으로 근사한 뒤 판정한다. 근사 정밀도는 options.flatness로 제어한다.
 * - path는 flatness 오차 범위 내에서 근사된다. edge 교차가 없고 containment fallback도 miss하면
 *   false를 반환할 수 있다.
 * - 판정 조건 (OR):
 *   1. flattened polyline의 임의 edge가 ellipse boundary와 교차한다.
 *   2. flattened polyline의 임의 점이 ellipse 내부(경계 포함)에 있다.
 *   3. ellipse 중심이 closed path 내부(경계 포함)에 있다.
 * - empty ellipse (radiusX ≤ 0 또는 radiusY ≤ 0): false.
 * - empty path (commands.length === 0): false.
 *
 * @param commands flatten할 path command sequence
 * @param ellipse  교차를 검사할 ellipse
 * @param options  flatten 옵션 (flatness, maxRecursion)
 */
export function intersectsPathEllipse(
  commands: readonly PathCommand[],
  ellipse: EllipseLike,
  options?: PathMeasurementOptions
): boolean {
  if (commands.length === 0) return false;
  const rx = readEllipseRadiusX(ellipse);
  const ry = readEllipseRadiusY(ellipse);
  const center = readEllipseCenter(ellipse);
  const ccx = readX(center);
  const ccy = readY(center);
  if (!allFinite([ccx, ccy, rx, ry])) return false;
  if (rx <= 0 || ry <= 0) return false;

  const hasClosed = commands.some((c) => c.kind === 'close');
  const tmp: { x: number; y: number }[] = [];
  flattenPathInto(tmp, commands, options);
  const n = tmp.length;
  if (n === 0) return false;

  // path 점이 ellipse 내부에 있거나 edge가 ellipse boundary와 교차하면 true
  for (let i = 0; i < n; i++) {
    const px = tmp[i].x;
    const py = tmp[i].y;
    // 조건 2: path 점이 ellipse 내부(경계 포함) — local 정규화 후 단위원 disk 판정
    const u = (px - ccx) / rx;
    const v = (py - ccy) / ry;
    if (u * u + v * v <= 1) return true;
    // 조건 1: edge (i → i+1)가 ellipse boundary와 교차
    if (i < n - 1) {
      const qx = tmp[i + 1].x;
      const qy = tmp[i + 1].y;
      if (lineFamilyEllipseIntersects(px, py, qx - px, qy - py, 'finite', ccx, ccy, rx, ry, DEFAULT_EPSILON)) {
        return true;
      }
    }
  }

  // 조건 3: ellipse 중심이 closed path 내부에 있는지 (polygon containment)
  // CloseCommand가 있는 closed path에만 적용한다. open path는 면적을 정의하지 않으므로 제외한다.
  if (n >= 3 && hasClosed) {
    if (polygonContainsPoint(tmp, ccx, ccy, DEFAULT_EPSILON)) return true;
  }

  return false;
}
