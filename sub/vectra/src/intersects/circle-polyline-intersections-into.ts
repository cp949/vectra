import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { lineFamilyEllipseIntersectionPoints } from '../internal/line-family-ellipse';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { CircleLike, PolylineLike, XYObjectWritable } from '../types';
import { hasNearbyPoint, hasNonFinitePolylinePoint, snapshotPolylinePoints } from './polyline-intersections.internal';

/**
 * circle circumference와 polyline의 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * polyline의 인접 segment를 순서대로 순회하며 각 segment와 circle circumference의 range 안 교점을
 * `segmentCircleIntersectionsInto`와 같은 line-family × ellipse(반지름이 같은 ellipse) root 정책으로
 * 모은다. polyline은 open path이므로 마지막 point에서 첫 point로 닫지 않는다.
 * - proper two-point는 segment-local parameter `t` 오름차순 두 점, tangent는 접점 t가 range 안일 때
 *   1점이다.
 * - circle disk 내부에 segment가 완전히 포함되면(boundary root 없음) 빈 배열이다. circumference root만
 *   노출하고 disk containment은 점으로 보지 않는다.
 * - 인접 segment가 같은 circle point를 보고하면 same-point dedupe로 1점만 남긴다.
 * - zero-length polyline segment는 point relation으로 환원하지 않고 건너뛴다.
 * - empty circle(`radius <= 0`), `points.length < 2`, 좌표가 하나라도 non-finite(circle center/radius
 *   또는 polyline 좌표)이면 빈 배열이다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. `outPoints`가 polyline array와 같은
 * reference여도 alias-safe하도록 clear 전에 입력 좌표를 snapshot한다. push되는 point는 매 호출 새
 * `{ x, y }` object이며 입력 point object를 재사용하지 않는다. 반환 순서는 polyline segment index
 * 오름차순이고, 같은 segment 안에서는 segment-local parameter `t` 오름차순이다.
 * `epsilon`은 discriminant tangent/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다. range
 * 판정은 segment-local parameter의 정확 비교를 따른다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param circle 교점을 구할 circle
 * @param polyline 교점을 구할 polyline. point ordering의 기준이다.
 * @param epsilon discriminant tangent/dedupe 판정 임계값
 */
export function circlePolylineIntersectionsInto(
  outPoints: XYObjectWritable[],
  circle: CircleLike,
  polyline: PolylineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const center = readCircleCenter(circle);
  const cx = readX(center);
  const cy = readY(center);
  const radius = readCircleRadius(circle);
  const pts = snapshotPolylinePoints(readPolylinePoints(polyline));

  outPoints.length = 0;
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(radius)) return outPoints;
  if (radius <= 0) return outPoints;
  if (pts.length < 2) return outPoints;
  if (hasNonFinitePolylinePoint(pts)) return outPoints;

  const epsSq = epsilon * epsilon;
  // segment별 root를 받는 재사용 버퍼. lineFamilyEllipseIntersectionPoints가 매 호출 clear한다.
  const local: XYObjectWritable[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i].x;
    const ay = pts[i].y;
    const bx = pts[i + 1].x;
    const by = pts[i + 1].y;
    // zero-length polyline segment는 point relation으로 환원하지 않고 건너뛴다.
    if (ax === bx && ay === by) continue;

    lineFamilyEllipseIntersectionPoints(local, ax, ay, bx - ax, by - ay, 'finite', cx, cy, radius, radius, epsilon);
    for (let k = 0; k < local.length; k++) {
      if (!hasNearbyPoint(outPoints, local[k].x, local[k].y, epsSq)) {
        outPoints.push({ x: local[k].x, y: local[k].y });
      }
    }
  }

  return outPoints;
}
