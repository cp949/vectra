import { pointDist, readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline을 arc-length 기준 균등 간격으로 샘플링해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * empty polyline(`hasSegments === false`)은 outPoints를 비우고 반환한다.
 *
 * 시작점(distance 0)은 항상 포함된다. `options.includeLast !== false`이면 마지막
 * vertex도 포함한다. 마지막 균등 sample이 끝점과 정확히 같은 좌표이면 중복 push하지 않는다.
 * repeated-point polyline(totalLen === 0)은 시작점 1개만 push한다.
 *
 * `spacing <= 0`이거나 finite가 아니면 RangeError를 던진다.
 *
 * @param outPoints 샘플링된 point object를 기록할 writable output array
 * @param polyline 샘플링할 polyline
 * @param spacing 균등 간격 (arc-length 단위, finite positive number)
 * @param options includeLast — false이면 마지막 vertex를 강제 포함하지 않는다
 */
export function sampleUniformInto(
  outPoints: XYObjectWritable[],
  polyline: PolylineLike,
  spacing: number,
  options?: { includeLast?: boolean }
): XYObjectWritable[] {
  if (!Number.isFinite(spacing) || spacing <= 0) {
    throw new RangeError('spacing must be a finite positive number');
  }

  const pts = readPolylinePoints(polyline);
  const n = pts.length;

  // empty 또는 single-point polyline은 segment 없으므로 빈 배열 반환
  if (n < 2) {
    outPoints.length = 0;
    return outPoints;
  }

  const includeLast = options?.includeLast !== false;

  // segment별 누적 길이와 좌표를 미리 snapshot
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  const segLens: number[] = new Array(n - 1);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }
  for (let i = 0; i < n - 1; i++) {
    segLens[i] = pointDist(xs[i], ys[i], xs[i + 1], ys[i + 1]);
  }
  const totalLen = segLens.reduce((sum, len) => sum + len, 0);

  outPoints.length = 0;

  // repeated-point polyline — total length 0이면 시작점만
  if (totalLen === 0) {
    outPoints.push({ x: xs[0], y: ys[0] });
    return outPoints;
  }

  // 시작점 push
  outPoints.push({ x: xs[0], y: ys[0] });

  let segIdx = 0; // 현재 보간 중인 segment index
  let segAcc = 0; // 현재 segment 시작까지의 누적 arc-length
  let dist = spacing; // 다음 sample의 arc-length target

  while (dist < totalLen) {
    // dist가 속하는 segment를 찾는다
    while (segIdx < n - 2 && segAcc + segLens[segIdx] < dist) {
      segAcc += segLens[segIdx];
      segIdx++;
    }

    const sl = segLens[segIdx];
    if (sl === 0) {
      // zero-length segment: 해당 점 그대로
      outPoints.push({ x: xs[segIdx], y: ys[segIdx] });
    } else {
      const localT = Math.max(0, Math.min(1, (dist - segAcc) / sl));
      outPoints.push({
        x: xs[segIdx] + localT * (xs[segIdx + 1] - xs[segIdx]),
        y: ys[segIdx] + localT * (ys[segIdx + 1] - ys[segIdx]),
      });
    }

    dist += spacing;
  }

  if (includeLast) {
    const lastX = xs[n - 1];
    const lastY = ys[n - 1];
    const prev = outPoints[outPoints.length - 1];
    // 마지막 push된 point와 끝점이 정확히 같으면 중복 push 안 함
    if (prev.x !== lastX || prev.y !== lastY) {
      outPoints.push({ x: lastX, y: lastY });
    }
  }

  return outPoints;
}
