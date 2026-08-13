import { readX, readY } from '../internal/xy';
import type { CenterArcWritable, XYInput, XYLike } from '../types';
import { cubicPointAtTInto } from './cubic-point-at-t-into';

interface ValidatedCubicToArcsInputs {
  p0: XYLike;
  p1: XYLike;
  p2: XYLike;
  p3: XYLike;
}

/**
 * cubicToArcsInto 입력을 검증한다.
 *
 * options 파생값(errorTolerance/maxSegments/minSegmentT)을 좌표보다 먼저 검사해
 * 원본 함수와 동일한 에러 우선순위를 유지한다.
 */
export function validateCubicToArcsInputs(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  errorTolerance: number,
  maxSegments: number,
  minSegmentT: number
): ValidatedCubicToArcsInputs {
  if (!(Number.isFinite(errorTolerance) && errorTolerance > 0)) {
    throw new RangeError('cubicToArcsInto: errorTolerance must be a finite positive number');
  }
  if (!(Number.isFinite(maxSegments) && maxSegments > 0)) {
    throw new RangeError('cubicToArcsInto: maxSegments must be a finite positive number');
  }
  if (!(Number.isFinite(minSegmentT) && minSegmentT > 0)) {
    throw new RangeError('cubicToArcsInto: minSegmentT must be a finite positive number');
  }

  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  if (
    !Number.isFinite(p0x) ||
    !Number.isFinite(p0y) ||
    !Number.isFinite(p1x) ||
    !Number.isFinite(p1y) ||
    !Number.isFinite(p2x) ||
    !Number.isFinite(p2y) ||
    !Number.isFinite(p3x) ||
    !Number.isFinite(p3y)
  ) {
    throw new RangeError('cubicToArcsInto: all control points must be finite');
  }

  return {
    p0: { x: p0x, y: p0y },
    p1: { x: p1x, y: p1y },
    p2: { x: p2x, y: p2y },
    p3: { x: p3x, y: p3y },
  };
}

/**
 * 세 점을 지나는 circumcircle의 center와 반지름을 반환한다.
 *
 * collinear이거나 반지름이 유효하지 않으면 null을 반환한다.
 */
function circumcircle(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { cx: number; cy: number; r: number } | null {
  const D = 2 * (x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
  const s0 = x0 * x0 + y0 * y0;
  const s1 = x1 * x1 + y1 * y1;
  const s2 = x2 * x2 + y2 * y2;
  const cx = (s0 * (y1 - y2) + s1 * (y2 - y0) + s2 * (y0 - y1)) / D;
  const cy = (s0 * (x2 - x1) + s1 * (x0 - x2) + s2 * (x1 - x0)) / D;
  const dx = x0 - cx;
  const dy = y0 - cy;
  const r = Math.hypot(dx, dy);
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r) || !(r > 0)) {
    return null;
  }
  return { cx, cy, r };
}

/**
 * quarter-point error metric으로 tolerance 충족 여부를 판정하고, 충족 시 angle-unwrap 후 arc를 push한다.
 *
 * tolerance를 만족하지 못하면 false를 반환한다 — 호출자(subdivideCubicToTolerance)가 재분할 여부를 결정한다.
 * err이 non-finite이거나 out.length가 maxSegments에 도달하면 RangeError를 던진다.
 */
function tryEmitArcFromSegment(
  out: CenterArcWritable[],
  sx: number,
  sy: number,
  mx: number,
  my: number,
  ex: number,
  ey: number,
  q1x: number,
  q1y: number,
  q3x: number,
  q3y: number,
  cx: number,
  cy: number,
  r: number,
  errorTolerance: number,
  maxSegments: number
): boolean {
  const dq1x = q1x - cx;
  const dq1y = q1y - cy;
  const dq3x = q3x - cx;
  const dq3y = q3y - cy;
  const err1 = Math.abs(Math.hypot(dq1x, dq1y) - r);
  const err3 = Math.abs(Math.hypot(dq3x, dq3y) - r);
  const err = err1 > err3 ? err1 : err3;

  if (!Number.isFinite(err)) {
    throw new RangeError('cubicToArcsInto: non-finite error metric');
  }

  if (err > errorTolerance) {
    return false;
  }

  if (out.length >= maxSegments) {
    throw new RangeError('cubicToArcsInto: maxSegments exceeded');
  }

  const startAngle = Math.atan2(sy - cy, sx - cx);
  const rawEndAngle = Math.atan2(ey - cy, ex - cx);
  const midAngle = Math.atan2(my - cy, mx - cx);
  // midpoint 각도로 진행 방향을 정한 뒤 endAngle을 unwrap한다.
  // center-arc 규약: consumer는 sweep flag가 아니라 (endAngle - startAngle)로 보간하므로
  // 이 차이가 진행 방향과 각폭을 담아야 한다. raw atan2 endAngle은 -π 경계에서 부호가 뒤집힌다.
  const TWO_PI = 2 * Math.PI;
  const relMid = (((midAngle - startAngle) % TWO_PI) + TWO_PI) % TWO_PI;
  const relEnd = (((rawEndAngle - startAngle) % TWO_PI) + TWO_PI) % TWO_PI;
  const sweep = relEnd === 0 ? true : relMid < relEnd;
  const endAngle = startAngle + (sweep ? relEnd : relEnd - TWO_PI);

  out.push({ cx, cy, rx: r, ry: r, xRotation: 0, startAngle, endAngle, sweep });

  return true;
}

/**
 * cubic Bezier를 LIFO stack 기반 adaptive subdivision으로 순회하며 tolerance를 만족하는 arc들을 out에 push한다.
 *
 * out은 이미 clear된 상태로 전달받는다 (호출자 책임). 좌표는 이미 finite/degenerate 검증을 통과했다고 가정한다.
 * eval은 공유 `cubicPointAtTInto`를 재사용 scratch 객체에 기록하는 방식으로 수행해 루프 내 할당을 만들지 않는다.
 */
export function subdivideCubicToTolerance(
  out: CenterArcWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  errorTolerance: number,
  maxSegments: number,
  minSegmentT: number
): void {
  const scratch = { x: 0, y: 0 };

  // LIFO stack: 오른쪽 segment를 먼저 push하여 왼쪽이 먼저 처리되도록 한다
  const stack: [number, number][] = [[0, 1]];

  while (stack.length > 0) {
    const seg = stack.pop() as [number, number];
    const t0 = seg[0];
    const t1 = seg[1];
    const tSpan = t1 - t0;
    const tMid = (t0 + t1) * 0.5;

    cubicPointAtTInto(scratch, p0, p1, p2, p3, t0);
    const sx = scratch.x;
    const sy = scratch.y;
    cubicPointAtTInto(scratch, p0, p1, p2, p3, tMid);
    const mx = scratch.x;
    const my = scratch.y;
    cubicPointAtTInto(scratch, p0, p1, p2, p3, t1);
    const ex = scratch.x;
    const ey = scratch.y;

    if (
      !Number.isFinite(sx) ||
      !Number.isFinite(sy) ||
      !Number.isFinite(mx) ||
      !Number.isFinite(my) ||
      !Number.isFinite(ex) ||
      !Number.isFinite(ey)
    ) {
      throw new RangeError('cubicToArcsInto: non-finite coordinate in cubic evaluation');
    }

    const circle = circumcircle(sx, sy, mx, my, ex, ey);

    if (circle === null) {
      if (tSpan < minSegmentT) {
        throw new RangeError('cubicToArcsInto: collinear segment cannot be approximated by a circular arc');
      }
      stack.push([tMid, t1]);
      stack.push([t0, tMid]);
      continue;
    }

    const { cx, cy, r } = circle;

    // error metric: quarter-point 표본의 point-to-circle deviation 최대값
    cubicPointAtTInto(scratch, p0, p1, p2, p3, t0 + tSpan * 0.25);
    const q1x = scratch.x;
    const q1y = scratch.y;
    cubicPointAtTInto(scratch, p0, p1, p2, p3, t1 - tSpan * 0.25);
    const q3x = scratch.x;
    const q3y = scratch.y;

    const accepted = tryEmitArcFromSegment(
      out,
      sx,
      sy,
      mx,
      my,
      ex,
      ey,
      q1x,
      q1y,
      q3x,
      q3y,
      cx,
      cy,
      r,
      errorTolerance,
      maxSegments
    );

    if (!accepted) {
      if (tSpan < minSegmentT) {
        throw new RangeError('cubicToArcsInto: segment too small, error tolerance not satisfied');
      }
      stack.push([tMid, t1]);
      stack.push([t0, tMid]);
    }
  }
}
