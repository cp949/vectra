import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PolygonLike, XYInput, XYObjectWritable } from '../types';

/**
 * point set을 center 기준 polar angle 순서로 정렬해 outPoints에 새 point object로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 새 `{ x, y }` point가 push되며, 같은 outPoints를 반환한다.
 * 입력 point array와 outPoints가 같은 배열이어도 안전하다. clear 전에 좌표를 snapshot한다.
 *
 * `atan2(y - cy, x - cx)` 오름차순으로 정렬한다. 좌표계 convention을 강제하지 않는다.
 * convex hull이 아니다. 입력 point를 삭제하지 않으며 duplicate point도 모두 유지한다. 출력 길이는 입력 길이와 같다.
 * 기본 center는 입력 point의 arithmetic mean(`sum / n`)이다. `options.center`를 주면 그 좌표를 center로 쓴다.
 *
 * tie-break: angle이 같으면 center로부터 squared distance 오름차순, 그래도 같으면 원래 index 오름차순(stable).
 * non-finite 좌표로 angle이 `NaN`이 되는 point는 finite-angle point 뒤에 원래 순서로 둔다. throw하지 않는다.
 * 기본 center에서 어떤 point라도 non-finite면 center가 `NaN`이 되어 전체 angle이 `NaN` → 원래 순서를 보존한다.
 * `n === 0`이면 빈 배열, `n === 1`이면 해당 point 1개를 반환한다.
 *
 * @param outPoints 정렬된 point object를 기록할 writable output array
 * @param points 정렬할 point set (polygon vertex list 또는 bare point array)
 * @param options center — polar angle 기준 center. 생략하면 arithmetic mean을 쓴다
 */
export function sortPointsByAngleInto(
  outPoints: XYObjectWritable[],
  points: PolygonLike,
  options?: { center?: XYInput }
): XYObjectWritable[] {
  const pts = readPolygonPoints(points);
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

  let cx: number;
  let cy: number;
  if (options?.center !== undefined) {
    cx = readX(options.center);
    cy = readY(options.center);
  } else {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      sx += xs[i];
      sy += ys[i];
    }
    cx = sx / n;
    cy = sy / n;
  }

  const order: { angle: number; distSq: number; index: number }[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - cx;
    const dy = ys[i] - cy;
    order[i] = { angle: Math.atan2(dy, dx), distSq: dx * dx + dy * dy, index: i };
  }

  order.sort((a, b) => {
    // NaN-angle point는 finite-angle point 뒤로 보내고, 그들끼리는 원래 index 순서를 유지한다.
    const aNaN = Number.isNaN(a.angle);
    const bNaN = Number.isNaN(b.angle);
    if (aNaN || bNaN) {
      if (aNaN && bNaN) return a.index - b.index;
      return aNaN ? 1 : -1;
    }
    if (a.angle !== b.angle) return a.angle - b.angle;
    if (a.distSq !== b.distSq) return a.distSq - b.distSq;
    return a.index - b.index;
  });

  for (let i = 0; i < n; i++) {
    const idx = order[i].index;
    outPoints.push({ x: xs[idx], y: ys[idx] });
  }
  return outPoints;
}
