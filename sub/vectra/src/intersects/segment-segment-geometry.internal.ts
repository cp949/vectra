export function allFinite(...values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}

export function pointPointDist(ax: number, ay: number, bx: number, by: number): number {
  // 직접 차분은 같은 크기 좌표에서 exact(Sterbenz)라 epsilon 경계에서 boolean과 같은 거리다.
  // 차분/거리가 overflow로 non-finite가 될 때만 scale 정규화 fallback을 쓴다.
  const direct = Math.hypot(ax - bx, ay - by);
  if (Number.isFinite(direct)) return direct;
  const scale = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale)) return Number.POSITIVE_INFINITY;
  if (scale === 0) return 0;
  return scale * Math.hypot(ax / scale - bx / scale, ay / scale - by / scale);
}

export function pointLineDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const qx = px - ax;
  const qy = py - ay;
  const dx = bx - ax;
  const dy = by - ay;
  if (allFinite(qx, qy, dx, dy)) {
    const scale = Math.max(Math.abs(qx), Math.abs(qy), Math.abs(dx), Math.abs(dy));
    if (scale === 0) return 0;
    const nqx = qx / scale;
    const nqy = qy / scale;
    const ndx = dx / scale;
    const ndy = dy / scale;
    const len = Math.hypot(ndx, ndy);
    if (len === 0) return pointPointDist(px, py, ax, ay);
    const scaledDist = (scale * Math.abs(cross2(nqx, nqy, ndx, ndy))) / len;
    const axisDist = axisProjectedLineDist(qx, qy, dx, dy);
    return axisDist === undefined ? scaledDist : Math.max(scaledDist, axisDist);
  }

  const scale = Math.max(Math.abs(px), Math.abs(py), Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale)) return Number.POSITIVE_INFINITY;
  if (scale === 0) return 0;
  const npx = px / scale;
  const npy = py / scale;
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const ndx = nbx - nax;
  const ndy = nby - nay;
  const len = Math.hypot(ndx, ndy);
  if (len === 0) return pointPointDist(px, py, ax, ay);
  const scaledDist = (scale * Math.abs(cross2(npx - nax, npy - nay, ndx, ndy))) / len;
  const axisDist = axisProjectedLineDist(npx - nax, npy - nay, ndx, ndy);
  return axisDist === undefined ? scaledDist : Math.max(scaledDist, scale * axisDist);
}

export function axisProjectedLineDist(qx: number, qy: number, dx: number, dy: number): number | undefined {
  const len = Math.hypot(dx, dy);
  if (!Number.isFinite(len) || len === 0) return undefined;
  // len !== 0이므로 dominant 축 성분은 0이 아니다(반대였다면 len === 0).
  if (Math.abs(dx) >= Math.abs(dy)) {
    const t = qx / dx;
    const residual = qy - t * dy;
    const dist = Math.abs(residual) * (Math.abs(dx) / len);
    return Number.isFinite(dist) ? dist : undefined;
  }
  const t = qy / dy;
  const residual = qx - t * dx;
  const dist = Math.abs(residual) * (Math.abs(dy) / len);
  return Number.isFinite(dist) ? dist : undefined;
}

export function segmentEndpointsCollinearWithinDistance(
  ax0: number,
  ay0: number,
  ax1: number,
  ay1: number,
  bx0: number,
  by0: number,
  bx1: number,
  by1: number,
  epsilon: number
): boolean {
  const startDist = pointLineDist(bx0, by0, ax0, ay0, ax1, ay1);
  const endDist = pointLineDist(bx1, by1, ax0, ay0, ax1, ay1);
  return Number.isFinite(startDist) && Number.isFinite(endDist) && startDist <= epsilon && endDist <= epsilon;
}

export function parameterOnSegmentPoint(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const qx = px - ax;
  const qy = py - ay;
  const dx = bx - ax;
  const dy = by - ay;
  if (allFinite(qx, qy, dx, dy) && (dx !== 0 || dy !== 0)) {
    if (Math.abs(dx) >= Math.abs(dy)) return qx / dx;
    return qy / dy;
  }

  const scale = Math.max(Math.abs(px), Math.abs(py), Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
  if (!Number.isFinite(scale) || scale === 0) return Number.NaN;
  const npx = px / scale;
  const npy = py / scale;
  const nax = ax / scale;
  const nay = ay / scale;
  const nbx = bx / scale;
  const nby = by / scale;
  const ndx = nbx - nax;
  const ndy = nby - nay;
  if (Math.abs(ndx) >= Math.abs(ndy)) return (npx - nax) / ndx;
  return (npy - nay) / ndy;
}

export function interpolateCoord(start: number, end: number, t: number): number {
  if (Number.isFinite(end - start)) return start + t * (end - start);
  const scale = Math.max(Math.abs(start), Math.abs(end));
  if (!Number.isFinite(scale) || scale === 0) return Number.NaN;
  return scale * (start / scale + t * (end / scale - start / scale));
}

export function interpolationScale(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax), Math.abs(ay), Math.abs(bx), Math.abs(by));
}

export function agreesWithEndpointParameter(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number,
  epsilon: number,
  allowRoundedEndpoint: boolean
): boolean {
  if (t !== 0 && t !== 1) return true;
  const endpointDist = t === 0 ? pointPointDist(x, y, ax, ay) : pointPointDist(x, y, bx, by);
  if (endpointDist <= epsilon) return true;
  if (!allowRoundedEndpoint) return false;
  const projectedT = parameterOnSegmentPoint(x, y, ax, ay, bx, by);
  return allFinite(projectedT) && projectedT >= 0 && projectedT <= 1;
}

export function pointAgreesWithSegment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number,
  epsilon: number,
  allowRoundedEndpoint = false
): boolean {
  return (
    agreesWithEndpointParameter(x, y, ax, ay, bx, by, t, epsilon, allowRoundedEndpoint) &&
    pointLineDist(x, y, ax, ay, bx, by) <= epsilon
  );
}

export function cross2(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

/** t를 [0, 1]로 clamp한다. */
export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** -0을 +0으로 정규화한다. parameter 출력 부호를 일관되게 유지한다. */
export function normalizeZero(t: number): number {
  return t === 0 ? 0 : t;
}
