import { readX, readY, writeXY } from '../internal/xy';
import type { BezierDegreeReductionOptions, QuadraticCurveWritable, XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve를 quadratic Bezier curve로 근사 축소하여 성공 시 out에 기록하고 `true`를 반환한다.
 *
 * 알고리즘:
 * ```
 * q0 = p0
 * q2 = p3
 * q1 = ((3*p1 - p0) + (3*p2 - p3)) / 4   (degree elevation inverse의 symmetric average)
 * ```
 *
 * 후보 quadratic `{q0, q1, q2}`를 다시 cubic으로 degree elevation한 control point `c0..c3`와
 * 원본 cubic control point `p0..p3`의 최대 편차가 `tolerance` 이하이면 성공한다.
 * `c0 = p0`, `c3 = p3`이므로 endpoint 편차는 finite 입력에서 항상 0이다.
 *
 * 정확히 quadratic에서 elevation된 cubic은 성공한다. 일반 cubic은 기본 tolerance에서 대부분 실패한다.
 *
 * 실패 시 `out`은 미수정이고 `false`를 반환한다. 성공 시에만 `out.p0`, `out.p1`, `out.p2`를 기록한다.
 * max error가 non-finite이면 tolerance 비교가 실패하므로 `false`가 된다.
 *
 * aliasing 안전: 입력을 모두 읽고 성공 판정 후 output을 기록한다.
 *
 * @param out 결과 quadratic curve를 기록할 writable output
 * @param p0 cubic curve 시작점
 * @param p1 cubic curve 첫 번째 제어점
 * @param p2 cubic curve 두 번째 제어점
 * @param p3 cubic curve 끝점
 * @param options 축소 tolerance 옵션. `tolerance`가 finite number가 아니거나 음수이면 RangeError.
 */
export function reduceBezierDegreeInto<Out extends QuadraticCurveWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  options?: BezierDegreeReductionOptions
): boolean {
  const tolerance = options?.tolerance ?? 1e-9;
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw new RangeError(`reduceBezierDegreeInto: tolerance must be a finite number >= 0, got ${tolerance}`);
  }

  // aliasing 안전을 위해 입력을 모두 먼저 읽는다
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  // quadratic control point 후보: q1 = ((3*p1 - p0) + (3*p2 - p3)) / 4
  const q1x = (3 * p1x - p0x + (3 * p2x - p3x)) / 4;
  const q1y = (3 * p1y - p0y + (3 * p2y - p3y)) / 4;

  // 후보 quadratic {q0=p0, q1, q2=p3}을 다시 cubic으로 degree elevation
  const c0x = p0x;
  const c0y = p0y;
  const c1x = p0x + (2 / 3) * (q1x - p0x);
  const c1y = p0y + (2 / 3) * (q1y - p0y);
  const c2x = p3x + (2 / 3) * (q1x - p3x);
  const c2y = p3y + (2 / 3) * (q1y - p3y);
  const c3x = p3x;
  const c3y = p3y;

  // 원본 cubic control point와의 최대 편차
  const maxError = Math.max(
    Math.hypot(c0x - p0x, c0y - p0y),
    Math.hypot(c1x - p1x, c1y - p1y),
    Math.hypot(c2x - p2x, c2y - p2y),
    Math.hypot(c3x - p3x, c3y - p3y)
  );

  // non-finite maxError는 `maxError <= tolerance`가 false가 되어 실패한다
  if (!(maxError <= tolerance)) {
    return false;
  }

  writeXY(out.p0 as XYWritable, p0x, p0y);
  writeXY(out.p1 as XYWritable, q1x, q1y);
  writeXY(out.p2 as XYWritable, p3x, p3y);
  return true;
}
