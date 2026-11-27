import type { Polyline, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * polyline에서 arc-length 기준 균등하게 count개 point를 샘플링해 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * empty polyline(`hasSegments === false`)은 outPoints를 비우고 반환한다.
 *
 * `count === 1`이면 시작점 1개만 기록한다. `count >= 2`이면 시작점과 끝점을 포함해
 * 균등 간격으로 count개를 기록한다.
 * repeated-point polyline(totalLen === 0)은 시작점을 count개 push한다.
 *
 * `count <= 0` 또는 정수가 아니면 RangeError를 던진다.
 *
 * @param outPoints 샘플링된 point object를 기록할 writable output array
 * @param polyline 샘플링할 polyline
 * @param count 추출할 point 수 (positive integer)
 */
export function sampleFixedCountInto(outPoints: PointWritable[], polyline: Polyline, count: number): PointWritable[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('count must be a positive integer');
  }

  const pts = polyline;
  const n = pts.length;

  // empty 또는 single-point polyline은 segment 없으므로 빈 배열 반환
  if (n < 2) {
    outPoints.length = 0;
    return outPoints;
  }

  // 좌표와 누적 길이를 한 번 순회로 만든다. outPoints가 polyline과 같은 배열이어도 안전하도록 clear 전에 모두 읽는다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  // cum[i]는 vertex i까지의 누적 길이다. `polylineTotalLength`와 같은 순서로 더한다(`hypot2`는 pointDist와 같다).
  const cum: number[] = new Array(n);
  let acc = 0;
  cum[0] = 0;
  for (let i = 0; i < n; i++) {
    const { x, y } = pts[i];
    xs[i] = x;
    ys[i] = y;
    if (i > 0) {
      acc += hypot2(x - xs[i - 1], y - ys[i - 1]);
      cum[i] = acc;
    }
  }
  const totalLen = acc;

  // 시작점 좌표
  const x0 = xs[0];
  const y0 = ys[0];

  outPoints.length = 0;

  if (count === 1) {
    outPoints.push({ x: x0, y: y0 });
    return outPoints;
  }

  // repeated-point polyline — total length 0이면 count개 모두 시작점
  if (totalLen === 0) {
    for (let i = 0; i < count; i++) {
      outPoints.push({ x: x0, y: y0 });
    }
    return outPoints;
  }

  // count >= 2: 시작점과 끝점 포함, 균등 간격
  // target은 비감소다. 그래서 `cum[seg] >= target`인 첫 segment를 앞으로만 움직이며 찾는다.
  // 이전 구현은 샘플마다 처음부터 순회했고 같은 조건(`acc + segLen >= target`, 마지막 segment는 무조건)으로 골랐다.
  // target이 NaN이면 어떤 비교도 거짓이라 마지막 segment가 선택된다. 이 경우는 sweep 위치를 바꾸지 않는다.
  const last = n - 1;
  const denom = count - 1;
  let sweep = 1;
  let cached = -1; // 아래 값을 계산해 둔 segment index
  let ax = 0;
  let ay = 0;
  let dx = 0;
  let dy = 0;
  let segLen = 0;
  for (let i = 0; i < count; i++) {
    const target = (i / denom) * totalLen;
    let seg = last;
    if (!Number.isNaN(target)) {
      while (sweep < last && !(cum[sweep] >= target)) sweep++;
      seg = sweep;
    }
    if (seg !== cached) {
      cached = seg;
      ax = xs[seg - 1];
      ay = ys[seg - 1];
      dx = xs[seg] - ax;
      dy = ys[seg] - ay;
      segLen = hypot2(dx, dy);
    }
    if (segLen === 0) {
      outPoints.push({ x: ax, y: ay });
    } else {
      const localT = Math.max(0, Math.min(1, (target - cum[seg - 1]) / segLen));
      outPoints.push({ x: ax + localT * dx, y: ay + localT * dy });
    }
  }

  return outPoints;
}
