/**
 * polygon과 line-family(segment, ray, infinite-line)의 boolean 교차 판정.
 *
 * `intersectsPolygonSegment`, `intersectsPolygonRay`, `intersectsPolygonInfiniteLine`만 호출한다.
 * 공유 `readX`/`readY`와 `polygonContainsPoint`는 라이브러리 전체가 쓰므로 입력 모양이 섞인 프로세스에서는 느리다.
 * 이 module은 `line-hit-read.internal`의 전용 reader로 점 좌표를 읽어, 캐시에 이 판정이 받는 입력 모양만 남긴다.
 */

import type { PolygonLike, XYInput } from '../types';
import { lineFamilyIntersects } from './line-family-core.internal';
import type { LineFamilyParam } from './line-family-param.internal';
import { lineHitX, lineHitY } from './line-hit-read.internal';
import { DEFAULT_EPSILON } from './numeric';

/** edge마다 새 record를 만들지 않으려고 재사용하는 segment param이다. `lineFamilyIntersects`는 param을 보관하지 않는다. */
const edgeParam: LineFamilyParam = { ox: 0, oy: 0, dx: 0, dy: 0, kind: 'finite' };

/**
 * line-family와 polygon이 교차하면 true를 반환한다.
 *
 * polygon의 모든 edge를 segment로 순회해 line-family와 교차하는지 확인한다.
 * edge 교차가 없고 segment인 경우 origin이 polygon 내부에 있으면 true(완전 포함).
 * pts.length < 3이면 empty polygon으로 false를 반환한다.
 *
 * @param line 교차를 검사할 line-family
 * @param polygon 교차를 검사할 polygon
 * @param epsilon 교차 판정 허용 오차. 생략하면 `lineFamilyIntersects`와 containment가 기본 epsilon을 쓴다.
 */
export function lineFamilyPolygonIntersects(
  line: LineFamilyParam,
  polygon: PolygonLike,
  epsilon: number | undefined
): boolean {
  const pts = Array.isArray(polygon)
    ? (polygon as readonly XYInput[])
    : (polygon as { points: readonly XYInput[] }).points;
  const n = pts.length;
  if (n < 3) return false;

  const first = pts[0];
  const x0 = lineHitX(first);
  const y0 = lineHitY(first);
  let ax = x0;
  let ay = y0;
  for (let i = 1; i <= n; i++) {
    let bx = x0;
    let by = y0;
    if (i < n) {
      const p = pts[i];
      bx = lineHitX(p);
      by = lineHitY(p);
    }
    edgeParam.ox = ax;
    edgeParam.oy = ay;
    edgeParam.dx = bx - ax;
    edgeParam.dy = by - ay;
    if (lineFamilyIntersects(line, edgeParam, epsilon)) return true;
    ax = bx;
    ay = by;
  }

  // segment가 polygon 내부에 완전히 포함된 경우: edge 교차 없이도 true
  if (line.kind !== 'finite') return false;
  return containsPoint(pts, n, line.ox, line.oy, epsilon ?? DEFAULT_EPSILON);
}

/**
 * (px, py)가 polygon boundary에서 `epsilon` 이내이면 true를 반환한다.
 *
 * `polygonBoundaryDistance(pts, px, py, null) <= epsilon`과 같은 값을 반환한다.
 * edge 거리 식은 `polygon-boundary-closest.internal`의 `polygonBoundaryClosestDistance`와 같은 순서·같은 연산이다.
 * 최소 거리를 구하지 않고 `epsilon` 이내인 edge를 찾으면 바로 true를 반환한다.
 * edge의 bounding box에서 `epsilon`의 2배와 좌표 크기의 1e-12배보다 멀리 떨어진 점은 거리 계산을 건너뛴다.
 * 이 여유는 closest 좌표 보간과 `Math.hypot`의 반올림 오차보다 충분히 크다.
 * NaN 거리인 edge는 최소 거리 계산이 무시하므로 여기서도 무시한다.
 */
function boundaryWithin(pts: readonly XYInput[], n: number, px: number, py: number, epsilon: number): boolean {
  const slack = epsilon > 0 ? 2 * epsilon : 0;
  const first = pts[0];
  const x0 = lineHitX(first);
  const y0 = lineHitY(first);
  let ax = x0;
  let ay = y0;
  for (let i = 1; i <= n; i++) {
    let bx = x0;
    let by = y0;
    if (i < n) {
      const p = pts[i];
      bx = lineHitX(p);
      by = lineHitY(p);
    }
    const xLo = ax < bx ? ax : bx;
    const xHi = ax < bx ? bx : ax;
    const yLo = ay < by ? ay : by;
    const yHi = ay < by ? by : ay;
    const xSlack = slack + 1e-12 * Math.max(Math.abs(ax), Math.abs(bx), Math.abs(px));
    const ySlack = slack + 1e-12 * Math.max(Math.abs(ay), Math.abs(by), Math.abs(py));
    if (px < xLo - xSlack || px > xHi + xSlack || py < yLo - ySlack || py > yHi + ySlack) {
      ax = bx;
      ay = by;
      continue;
    }
    const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by), Math.abs(px), Math.abs(py));
    const sax = scale === 0 ? ax : ax / scale;
    const say = scale === 0 ? ay : ay / scale;
    const sbx = scale === 0 ? bx : bx / scale;
    const sby = scale === 0 ? by : by / scale;
    const spx = scale === 0 ? px : px / scale;
    const spy = scale === 0 ? py : py / scale;
    const dx = sbx - sax;
    const dy = sby - say;
    const lenSq = dx * dx + dy * dy;
    let cx: number;
    let cy: number;
    if (lenSq === 0) {
      cx = ax;
      cy = ay;
    } else {
      const t = Math.max(0, Math.min(1, ((spx - sax) * dx + (spy - say) * dy) / lenSq));
      cx = ax * (1 - t) + bx * t;
      cy = ay * (1 - t) + by * t;
    }
    if (Math.hypot(cx - px, cy - py) <= epsilon) return true;
    ax = bx;
    ay = by;
  }
  // 모든 edge 거리가 NaN이면 최소 거리는 초기값 Infinity다.
  return Infinity <= epsilon;
}

/**
 * ray casting으로 (px, py)가 polygon 내부(boundary 포함)에 있는지 판정한다.
 *
 * `polygonContainsPoint`와 같은 값을 반환한다. 호출자가 `n >= 3`을 보장해야 한다.
 */
function containsPoint(pts: readonly XYInput[], n: number, px: number, py: number, epsilon: number): boolean {
  if (boundaryWithin(pts, n, px, py, epsilon)) return true;

  const first = pts[0];
  const x0 = lineHitX(first);
  const y0 = lineHitY(first);
  let ax = x0;
  let ay = y0;
  let inside = false;
  for (let i = 1; i <= n; i++) {
    let bx = x0;
    let by = y0;
    if (i < n) {
      const p = pts[i];
      bx = lineHitX(p);
      by = lineHitY(p);
    }
    // lower-left rule: y 범위에서 py를 포함하고, 교점이 px보다 오른쪽이면 crossing
    if ((ay <= py && by > py) || (by <= py && ay > py)) {
      // weighted interpolation은 `bx - ax` overflow를 피한다.
      const t = (py - ay) / (by - ay);
      const xCross = ax * (1 - t) + bx * t;
      if (xCross > px) inside = !inside;
    }
    ax = bx;
    ay = by;
  }
  return inside;
}
