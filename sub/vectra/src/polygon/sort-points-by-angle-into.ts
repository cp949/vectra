import type { Polygon, Point, PolygonWritable } from '../types/flat-shapes.internal';

/**
 * point set을 center 기준 polar angle 순서로 정렬해 outPoints에 좌표 쌍으로 기록한다.
 *
 * outPoints는 먼저 clear된 뒤 좌표 쌍이 push되며, 같은 outPoints를 반환한다.
 * 입력 좌표 배열과 outPoints가 같은 배열이어도 안전하다.
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
 * @param outPoints 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param points 정렬할 polygon 좌표 배열
 * @param options polar angle 기준 중심점. 생략하면 vertex의 산술 평균을 쓴다
 */
export function sortPointsByAngleInto(
  outPoints: PolygonWritable,
  points: Polygon,
  options?: { readonly center: Point }
): PolygonWritable {
  const n = points.length / 2;
  const source = outPoints === points ? points.slice() : points;
  outPoints.length = 0;
  if (n === 0) {
    return outPoints;
  }

  let cx: number;
  let cy: number;
  if (options !== undefined) {
    cx = options.center.x;
    cy = options.center.y;
  } else {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      sx += source[2 * i];
      sy += source[2 * i + 1];
    }
    cx = sx / n;
    cy = sy / n;
  }

  const order: { angle: number; distSq: number; index: number }[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const dx = source[2 * i] - cx;
    const dy = source[2 * i + 1] - cy;
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
    outPoints.push(source[2 * idx], source[2 * idx + 1]);
  }
  return outPoints;
}
