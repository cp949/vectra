import { readX, readY } from '../internal/xy';
import type { CenterArcWritable, CubicToArcsOptions, XYInput } from '../types';

/**
 * cubic Bezier를 circular center-form arc collection으로 근사해 out 배열에 기록하고 out을 반환한다.
 *
 * 호출 초기에 out.length = 0으로 clear한다. 이후 RangeError가 발생하면 out 내용을 보장하지 않는다.
 * zero-length degenerate cubic(네 control point가 모두 동일한 좌표)은 빈 배열을 반환한다.
 * 입력 좌표 또는 내부 산술 결과가 non-finite이면 RangeError로 실패한다.
 * collinear segment, maxSegments 초과, minSegmentT 수렴 실패는 RangeError로 실패한다.
 * options.errorTolerance, maxSegments, minSegmentT가 finite positive가 아니면 RangeError로 실패한다.
 * 결과 arc는 circular(rx === ry)이고 xRotation === 0이다.
 * 결과 arc는 center-form 규약을 따른다. (endAngle - startAngle)의 부호와 크기가 진행 방향과 각폭을 담으며 sweep === (endAngle >= startAngle)이다. atan2 -π 경계를 교차하는 arc도 올바른 방향으로 기록한다.
 * 각 결과 arc는 새 plain object로 push한다. 입력 point나 기존 out element를 재사용하지 않는다.
 *
 * @param out arc를 기록할 writable array
 * @param p0 cubic Bezier 시작점
 * @param p1 첫 번째 control point
 * @param p2 두 번째 control point
 * @param p3 cubic Bezier 끝점
 * @param options 근사 옵션 (errorTolerance, maxSegments, minSegmentT)
 * @returns out
 */
export function cubicToArcsInto(
  out: CenterArcWritable[],
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: CubicToArcsOptions
): CenterArcWritable[] {
  out.length = 0;

  const errorTolerance = options?.errorTolerance ?? 1e-3;
  const maxSegments = options?.maxSegments ?? 64;
  const minSegmentT = options?.minSegmentT ?? 1e-6;

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

  // zero-length degenerate: 네 control point가 모두 동일한 좌표
  if (p0x === p1x && p0y === p1y && p0x === p2x && p0y === p2y && p0x === p3x && p0y === p3y) {
    return out;
  }

  // LIFO stack: 오른쪽 segment를 먼저 push하여 왼쪽이 먼저 처리되도록 한다
  const stack: [number, number][] = [[0, 1]];

  while (stack.length > 0) {
    const seg = stack.pop() as [number, number];
    const t0 = seg[0];
    const t1 = seg[1];
    const tSpan = t1 - t0;
    const tMid = (t0 + t1) * 0.5;

    const startPt = evalCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t0);
    const midPt = evalCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, tMid);
    const endPt = evalCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t1);

    const sx = startPt[0];
    const sy = startPt[1];
    const mx = midPt[0];
    const my = midPt[1];
    const ex = endPt[0];
    const ey = endPt[1];

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
    const q1Pt = evalCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t0 + tSpan * 0.25);
    const q3Pt = evalCubic(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t1 - tSpan * 0.25);

    const dq1x = q1Pt[0] - cx;
    const dq1y = q1Pt[1] - cy;
    const dq3x = q3Pt[0] - cx;
    const dq3y = q3Pt[1] - cy;
    const err1 = Math.abs(Math.hypot(dq1x, dq1y) - r);
    const err3 = Math.abs(Math.hypot(dq3x, dq3y) - r);
    const err = err1 > err3 ? err1 : err3;

    if (!Number.isFinite(err)) {
      throw new RangeError('cubicToArcsInto: non-finite error metric');
    }

    if (err <= errorTolerance) {
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
      out.push({
        cx,
        cy,
        rx: r,
        ry: r,
        xRotation: 0,
        startAngle,
        endAngle,
        sweep,
      });
    } else {
      if (tSpan < minSegmentT) {
        throw new RangeError('cubicToArcsInto: segment too small, error tolerance not satisfied');
      }
      stack.push([tMid, t1]);
      stack.push([t0, tMid]);
    }
  }

  return out;
}

/**
 * cubic Bezier를 파라미터 t에서 evaluate한다.
 *
 * t는 clamp 없이 수식 그대로 계산한다.
 */
function evalCubic(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  t: number
): [number, number] {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  const c1 = 3 * mt2 * t;
  const c2 = 3 * mt * t2;
  return [mt3 * p0x + c1 * p1x + c2 * p2x + t3 * p3x, mt3 * p0y + c1 * p1y + c2 * p2y + t3 * p3y];
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
