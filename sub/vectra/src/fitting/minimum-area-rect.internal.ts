/**
 * fitting domain이 쓰는 minimum-area oriented rectangle core helper.
 *
 * exact duplicate를 제거하고 monotonic chain convex hull을 만든 뒤, 각 hull edge axis로 hull point를
 * projection해 최소 area oriented rect candidate를 고른다. `linalg`/`oriented-rect` public leaf를
 * import하지 않고 domain-local로 둔다. `fitMinimumAreaRect*`가 공유한다.
 */

/** `computeMinimumAreaRect`의 결과. oriented rect center/size/angle을 담는다. */
export interface MinimumAreaRect {
  /** oriented rect center x. `-0`은 `0`으로 canonicalize. */
  readonly centerX: number;

  /** oriented rect center y. `-0`은 `0`으로 canonicalize. */
  readonly centerY: number;

  /** candidate edge axis 방향 width. strict positive finite. */
  readonly sizeX: number;

  /** perpendicular axis 방향 height. strict positive finite. */
  readonly sizeY: number;

  /** candidate edge axis의 `atan2(y, x)` 회전각. `-0`은 `0`으로 canonicalize. */
  readonly angle: number;
}

/** `-0`을 `0`으로 바꾼다. */
function canonicalizeZero(value: number): number {
  return value === 0 ? 0 : value;
}

/**
 * `(ox, oy) -> (ax, ay)`와 `(ox, oy) -> (bx, by)`의 2D cross product z component.
 *
 * monotonic chain hull에서 left/right turn 판정에 쓴다.
 */
function cross(ox: number, oy: number, ax: number, ay: number, bx: number, by: number): number {
  return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
}

/**
 * sorted unique point에서 monotonic chain convex hull을 만든다.
 *
 * cross product가 `<= epsilon`인 turn은 collinear로 보고 제거한다. hull은 CCW 순서의 vertex index
 * 배열이며 길이가 3 미만이면 hull이 degenerate(collinear)다.
 *
 * @param xs sorted unique x 좌표
 * @param ys sorted unique y 좌표
 * @param epsilon collinear turn 판정 tolerance
 */
function convexHullIndices(xs: readonly number[], ys: readonly number[], epsilon: number): number[] {
  const n = xs.length;
  const hull: number[] = [];

  // lower hull.
  for (let i = 0; i < n; i++) {
    while (
      hull.length >= 2 &&
      cross(
        xs[hull[hull.length - 2]],
        ys[hull[hull.length - 2]],
        xs[hull[hull.length - 1]],
        ys[hull[hull.length - 1]],
        xs[i],
        ys[i]
      ) <= epsilon
    ) {
      hull.pop();
    }
    hull.push(i);
  }

  // upper hull. lower hull 마지막 vertex는 upper에서 다시 시작점이 되므로 제외 길이를 기록한다.
  const lowerCount = hull.length + 1;
  for (let i = n - 2; i >= 0; i--) {
    while (
      hull.length >= lowerCount &&
      cross(
        xs[hull[hull.length - 2]],
        ys[hull[hull.length - 2]],
        xs[hull[hull.length - 1]],
        ys[hull[hull.length - 1]],
        xs[i],
        ys[i]
      ) <= epsilon
    ) {
      hull.pop();
    }
    hull.push(i);
  }

  // 마지막 vertex는 시작점과 중복되므로 제거한다.
  hull.pop();
  return hull;
}

/**
 * finite point collection에서 최소 area oriented rectangle을 계산한다.
 *
 * exact `(x, y)` duplicate를 제거하고 unique point가 3개 미만이면 degenerate로 `undefined`. sorted
 * unique point로 monotonic chain convex hull을 만들고 hull이 collinear(vertex 3개 미만)이거나 hull
 * area가 `epsilon` 이하이면 `undefined`. 각 hull edge axis로 hull point를 projection해 `width *
 * height`가 최소인 candidate를 고른다. edge length나 projection extent가 `epsilon` 이하이거나
 * non-finite인 candidate는 버린다. 같은 area는 먼저 발견한 hull edge를 strict `<`로 유지한다. 유효한
 * candidate가 없으면 `undefined`.
 *
 * caller가 finite 좌표를 보장한다. `epsilon`은 unique/collinear/extent 판정에만 쓰고 finite 검증에는
 * 쓰지 않는다.
 *
 * @param xs materialize된 finite x 좌표
 * @param ys materialize된 finite y 좌표
 * @param epsilon unique/collinear/degenerate extent 판정 tolerance
 */
export function computeMinimumAreaRect(
  xs: readonly number[],
  ys: readonly number[],
  epsilon: number
): MinimumAreaRect | undefined {
  const count = xs.length;

  // exact (x, y) duplicate 제거.
  const seen = new Set<string>();
  const ux: number[] = [];
  const uy: number[] = [];
  for (let i = 0; i < count; i++) {
    const key = `${xs[i]},${ys[i]}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    ux.push(xs[i]);
    uy.push(ys[i]);
  }
  if (ux.length < 3) {
    return undefined;
  }

  // x 오름차순, x 동률은 y 오름차순으로 정렬한다.
  const order = ux.map((_, i) => i).sort((a, b) => ux[a] - ux[b] || uy[a] - uy[b]);
  const sx = order.map((i) => ux[i]);
  const sy = order.map((i) => uy[i]);

  const hull = convexHullIndices(sx, sy, epsilon);
  const hullLength = hull.length;
  if (hullLength < 3) {
    return undefined;
  }

  // CCW hull의 shoelace area. epsilon 이하이면 degenerate.
  let area2 = 0;
  for (let i = 0; i < hullLength; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hullLength];
    area2 += sx[a] * sy[b] - sx[b] * sy[a];
  }
  if (Math.abs(area2) / 2 <= epsilon) {
    return undefined;
  }

  let best: MinimumAreaRect | undefined;
  let bestArea = Number.POSITIVE_INFINITY;
  for (let i = 0; i < hullLength; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hullLength];
    const ex = sx[b] - sx[a];
    const ey = sy[b] - sy[a];
    const edgeLength = Math.hypot(ex, ey);
    if (!(edgeLength > epsilon)) {
      continue;
    }
    // edge axis와 perpendicular axis(좌측 90도)로 hull point를 projection한다.
    const axx = ex / edgeLength;
    const axy = ey / edgeLength;
    let minU = Number.POSITIVE_INFINITY;
    let maxU = Number.NEGATIVE_INFINITY;
    let minV = Number.POSITIVE_INFINITY;
    let maxV = Number.NEGATIVE_INFINITY;
    for (let j = 0; j < hullLength; j++) {
      const px = sx[hull[j]];
      const py = sy[hull[j]];
      const u = px * axx + py * axy;
      const v = -px * axy + py * axx;
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    const width = maxU - minU;
    const height = maxV - minV;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= epsilon || height <= epsilon) {
      continue;
    }
    const candidateArea = width * height;
    // strict <로만 갱신해 동률은 먼저 발견한 hull edge를 유지한다.
    if (!(candidateArea < bestArea)) {
      continue;
    }
    const midU = (minU + maxU) / 2;
    const midV = (minV + maxV) / 2;
    // projection interval midpoint를 world-space center로 복원한다.
    const centerX = midU * axx - midV * axy;
    const centerY = midU * axy + midV * axx;
    const angle = Math.atan2(axy, axx);
    if (!Number.isFinite(centerX) || !Number.isFinite(centerY) || !Number.isFinite(angle)) {
      continue;
    }
    bestArea = candidateArea;
    best = {
      centerX: canonicalizeZero(centerX),
      centerY: canonicalizeZero(centerY),
      sizeX: width,
      sizeY: height,
      angle: canonicalizeZero(angle),
    };
  }

  return best;
}
