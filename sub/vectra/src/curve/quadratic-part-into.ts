import { readX, readY, writeXY } from '../internal/xy';
import type { QuadraticCurveWritable, XYInput, XYWritable } from '../types';

/**
 * quadratic Bezier curve의 파라미터 구간 [fromT, toT]에 해당하는 sub-curve를 out에 기록하고 out을 반환한다.
 *
 * 알고리즘: affine parameter composition.
 * `Q(u) = B(fromT + (toT - fromT)u)`의 quadratic control point를 직접 계산한다.
 * `fromT`/`toT`는 clamp하지 않으며, `fromT > toT`이면 역방향 subcurve를 반환한다.
 *
 * @param out sub-curve를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param fromT 구간 시작 파라미터
 * @param toT 구간 끝 파라미터
 */
export function quadraticPartInto<Out extends QuadraticCurveWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  fromT: number,
  toT: number
): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const fromMt = 1 - fromT;
  const toMt = 1 - toT;
  const fromT2 = fromT * fromT;
  const toT2 = toT * toT;

  const q0x = fromMt * fromMt * p0x + 2 * fromMt * fromT * p1x + fromT2 * p2x;
  const q0y = fromMt * fromMt * p0y + 2 * fromMt * fromT * p1y + fromT2 * p2y;
  const q2x = toMt * toMt * p0x + 2 * toMt * toT * p1x + toT2 * p2x;
  const q2y = toMt * toMt * p0y + 2 * toMt * toT * p1y + toT2 * p2y;

  const span = toT - fromT;
  const d0x = 2 * fromMt * (p1x - p0x) + 2 * fromT * (p2x - p1x);
  const d0y = 2 * fromMt * (p1y - p0y) + 2 * fromT * (p2y - p1y);
  const q1x = q0x + (span * d0x) / 2;
  const q1y = q0y + (span * d0y) / 2;

  writeXY(out.p0 as XYWritable, q0x, q0y);
  writeXY(out.p1 as XYWritable, q1x, q1y);
  writeXY(out.p2 as XYWritable, q2x, q2y);

  return out;
}
