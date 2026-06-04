import { readPolylinePoints } from '../internal/polyline';
import { readX, readY } from '../internal/xy';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline을 닫힌 point list로 만들어 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다 (clear 전에 좌표를 snapshot한다).
 * polygon topology 변환이 아니다. 첫 점 좌표를 마지막에 복제할 뿐 area/ring validation은 하지 않는다.
 *
 * - empty polyline: out을 clear하고 빈 배열을 반환한다.
 * - single-point polyline: 같은 좌표를 두 번 기록해 닫힌 point list를 만든다.
 * - open polyline: 마지막에 첫 점 좌표를 복제한다.
 * - 이미 닫힌 polyline(첫 점과 마지막 점이 `first.x === last.x && first.y === last.y` exact equality): source point 수만큼만 복제하고 close point를 추가하지 않는다.
 *
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파하며, closed 판정은 exact equality이므로
 * NaN 좌표를 가진 끝점은 절대 closed로 보지 않는다 (NaN !== NaN).
 *
 * @param outPoints 닫힌 point object를 기록할 writable output array
 * @param polyline point를 읽을 polyline
 */
export function closeInto(outPoints: XYObjectWritable[], polyline: PolylineLike): XYObjectWritable[] {
  const pts = readPolylinePoints(polyline);
  const n = pts.length;
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }

  outPoints.length = 0;

  if (n === 0) {
    return outPoints;
  }

  if (n === 1) {
    outPoints.push({ x: xs[0], y: ys[0] });
    outPoints.push({ x: xs[0], y: ys[0] });
    return outPoints;
  }

  for (let i = 0; i < n; i++) {
    outPoints.push({ x: xs[i], y: ys[i] });
  }

  // 이미 닫힌 polyline이면 close point를 추가하지 않는다.
  const alreadyClosed = xs[0] === xs[n - 1] && ys[0] === ys[n - 1];
  if (!alreadyClosed) {
    outPoints.push({ x: xs[0], y: ys[0] });
  }

  return outPoints;
}
