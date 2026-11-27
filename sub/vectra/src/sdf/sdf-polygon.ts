import { capsuleAxisDistanceXY } from '../internal/capsule';
import { hypot2 } from '../internal/numeric';
import type { Point, Polygon } from '../types/flat-shapes.internal';
import { canonicalizeZero, requireFinite } from './primitive.internal';

/**
 * polygon과 point 사이의 signed distance를 반환한다.
 *
 * 꼭짓점 3개 이상은 boundary까지의 거리에 containment sign을 적용한다. interior는 음수,
 * boundary는 0, exterior는 양수다. sign은 ray casting 결과를
 * 따르며 winding에 의존하지 않는다. self-intersecting polygon은 repair하지 않고 ray casting 결과를
 * 그대로 쓴다.
 *
 * 꼭짓점 1개는 해당 point까지의 거리, 2개는 segment까지의 거리이며
 * interior 음수 영역이 없다. repeated-point edge(zero-length segment)는 `NaN`을 만들지 않는다.
 *
 * 모든 vertex 좌표와 point 좌표는 finite여야 한다. 좌표 목록이 비었거나 길이가 홀수이면
 * `RangeError`, non-finite vertex/point 좌표도 `RangeError`다.
 *
 * @param polygon signed distance를 측정할 polygon
 * @param point polygon까지의 signed distance를 측정할 point
 */
export function sdfPolygon(polygon: Polygon, point: Point): number {
  const count = polygon.length;
  if (count === 0) {
    throw new RangeError('sdf polygon must have at least one vertex, got 0');
  }
  if (count % 2 !== 0) {
    throw new RangeError(`sdf polygon must have an even coordinate count, got ${count}`);
  }

  for (let i = 0; i < count; i += 2) {
    requireFinite(polygon[i], `polygon vertex[${i / 2}] x`);
    requireFinite(polygon[i + 1], `polygon vertex[${i / 2}] y`);
  }
  const px = requireFinite(point.x, 'point x');
  const py = requireFinite(point.y, 'point y');

  if (count === 2) {
    return canonicalizeZero(hypot2(polygon[0] - px, polygon[1] - py));
  }

  let boundary = Infinity;
  let inside = false;
  for (let i = 0; i < count; i += 2) {
    const j = (i + 2) % count;
    const ax = polygon[i];
    const ay = polygon[i + 1];
    const bx = polygon[j];
    const by = polygon[j + 1];
    const distance = capsuleAxisDistanceXY(ax, ay, bx, by, px, py);
    if (distance < boundary) boundary = distance;

    // 교점을 한 번만 센다. 가중 보간으로 bx - ax의 overflow를 피한다.
    if (count > 4 && ((ay <= py && by > py) || (by <= py && ay > py))) {
      const t = (py - ay) / (by - ay);
      if (ax * (1 - t) + bx * t > px) inside = !inside;
    }
  }

  if (boundary === 0) return 0;
  return inside ? -boundary : boundary;
}
