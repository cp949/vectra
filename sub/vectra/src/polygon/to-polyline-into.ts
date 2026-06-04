import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYObjectWritable } from '../types';

/**
 * polygon vertex를 순서대로 복사해 open polyline view로 outPoints에 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 새 `{ x, y }` point가 push되며, 같은 outPoints를 반환한다.
 * 입력 point array와 outPoints가 같은 배열이어도 안전하다. clear 전에 좌표를 snapshot한다.
 * point-collection 기준이다. `points.length < 3`을 empty로 보지 않고, 0개 point면 빈 배열을 반환한다.
 * 좌표 finite 여부를 검사하지 않고 그대로 복사한다.
 *
 * `options.close === true`이고 point가 1개 이상이면 첫 vertex 복사본을 끝에 추가해 닫힌 path로 만든다.
 * 이미 닫혀 있는지(마지막 vertex == 첫 vertex)는 검사하지 않는다.
 *
 * @param outPoints polyline point를 기록할 writable output array
 * @param polygon vertex를 읽을 polygon
 * @param options close — true이면 첫 vertex 복사본을 끝에 추가한다. 기본 false(open view)
 */
export function toPolylineInto(
  outPoints: XYObjectWritable[],
  polygon: PolygonLike,
  options?: { close?: boolean }
): XYObjectWritable[] {
  const pts = readPolygonPoints(polygon);
  const n = pts.length;
  // input/output array aliasing에 대비해 clear 전에 좌표를 snapshot한다.
  const xs: number[] = new Array(n);
  const ys: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = readX(pts[i]);
    ys[i] = readY(pts[i]);
  }
  outPoints.length = 0;
  for (let i = 0; i < n; i++) {
    outPoints.push({ x: xs[i], y: ys[i] });
  }
  if (options?.close === true && n >= 1) {
    outPoints.push({ x: xs[0], y: ys[0] });
  }
  return outPoints;
}
