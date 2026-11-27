import type { Polygon, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * polygon boundary를 implicit closed ring으로 보고 arc-length 균등 간격으로 샘플링해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 새 `{ x, y }` point가 push되며, 같은 outPoints를 반환한다.
 *
 * 마지막 vertex에서 첫 vertex로 닫히는 edge까지 포함한 perimeter를 따라 샘플링한다.
 * sample arc-length는 `0, spacing, 2*spacing, ...`로 total perimeter 미만까지이며, 시작점(거리 0)은 항상 포함한다.
 * closed ring이므로 끝점은 시작점과 같다. 끝점(시작점 복제)은 추가하지 않는다.
 *
 * point-collection 기준이다. vertex가 0개면 빈 배열을 반환하고, 1개이거나 perimeter가 0(repeated point)이면
 * 시작점 1개만 push한다.
 *
 * `spacing`이 finite positive number가 아니거나 perimeter가 finite가 아니면 RangeError를 던진다.
 *
 * @param outPoints 점을 기록할 writable 배열 (`{ x, y }[]`)
 * @param polygon boundary를 읽을 polygon
 * @param spacing 균등 간격 (arc-length 단위, finite positive number)
 */
export function pointsAlongEdgesInto(outPoints: PointWritable[], polygon: Polygon, spacing: number): PointWritable[] {
  if (!Number.isFinite(spacing) || spacing <= 0) {
    throw new RangeError('spacing must be a finite positive number');
  }

  const n = polygon.length / 2;
  outPoints.length = 0;

  if (n === 0) {
    return outPoints;
  }
  if (n === 1) {
    outPoints.push({ x: polygon[0], y: polygon[1] });
    return outPoints;
  }

  // closed ring edge i: vertex i → vertex (i+1)%n. 마지막 edge는 vertex n-1 → vertex 0.
  const segLens: number[] = new Array(n);
  let totalLen = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = polygon[2 * j] - polygon[2 * i];
    const dy = polygon[2 * j + 1] - polygon[2 * i + 1];
    const len = hypot2(dx, dy);
    segLens[i] = len;
    totalLen += len;
  }

  if (!Number.isFinite(totalLen)) {
    throw new RangeError('polygon perimeter must be finite');
  }

  // repeated-point polygon — perimeter 0이면 시작점만
  if (totalLen === 0) {
    outPoints.push({ x: polygon[0], y: polygon[1] });
    return outPoints;
  }

  let segIdx = 0; // 현재 보간 중인 edge index
  let segAcc = 0; // 현재 edge 시작까지의 누적 arc-length
  for (let dist = 0; dist < totalLen; dist += spacing) {
    // dist가 속하는 edge를 찾는다. 마지막 edge index(n-1)까지 전진한다.
    while (segIdx < n - 1 && segAcc + segLens[segIdx] < dist) {
      segAcc += segLens[segIdx];
      segIdx++;
    }

    const a = segIdx;
    const b = (segIdx + 1) % n;
    const sl = segLens[segIdx];
    if (sl === 0) {
      // zero-length edge: 해당 vertex 그대로
      outPoints.push({ x: polygon[2 * a], y: polygon[2 * a + 1] });
    } else {
      const localT = Math.max(0, Math.min(1, (dist - segAcc) / sl));
      outPoints.push({
        x: polygon[2 * a] + localT * (polygon[2 * b] - polygon[2 * a]),
        y: polygon[2 * a + 1] + localT * (polygon[2 * b + 1] - polygon[2 * a + 1]),
      });
    }
  }

  return outPoints;
}
