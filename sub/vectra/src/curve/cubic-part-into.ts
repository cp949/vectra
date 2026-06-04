import { readX, readY, writeXY } from '../internal/xy';
import type { CubicCurveWritable, XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve의 파라미터 구간 [fromT, toT]에 해당하는 sub-curve를 out에 기록하고 out을 반환한다.
 *
 * 알고리즘: affine parameter composition.
 * `Q(u) = B(fromT + (toT - fromT)u)`의 cubic control point를 직접 계산한다.
 * `fromT`/`toT`는 clamp하지 않으며, `fromT > toT`이면 역방향 subcurve를 반환한다.
 *
 * @param out sub-curve를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param fromT 구간 시작 파라미터
 * @param toT 구간 끝 파라미터
 */
export function cubicPartInto<Out extends CubicCurveWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  fromT: number,
  toT: number
): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const fromMt = 1 - fromT;
  const toMt = 1 - toT;
  const fromMt2 = fromMt * fromMt;
  const toMt2 = toMt * toMt;
  const fromT2 = fromT * fromT;
  const toT2 = toT * toT;
  const fromT3 = fromT2 * fromT;
  const toT3 = toT2 * toT;

  const q0x = fromMt2 * fromMt * p0x + 3 * fromMt2 * fromT * p1x + 3 * fromMt * fromT2 * p2x + fromT3 * p3x;
  const q0y = fromMt2 * fromMt * p0y + 3 * fromMt2 * fromT * p1y + 3 * fromMt * fromT2 * p2y + fromT3 * p3y;
  const q3x = toMt2 * toMt * p0x + 3 * toMt2 * toT * p1x + 3 * toMt * toT2 * p2x + toT3 * p3x;
  const q3y = toMt2 * toMt * p0y + 3 * toMt2 * toT * p1y + 3 * toMt * toT2 * p2y + toT3 * p3y;

  const span = toT - fromT;
  const d0x = 3 * (fromMt2 * (p1x - p0x) + 2 * fromMt * fromT * (p2x - p1x) + fromT2 * (p3x - p2x));
  const d0y = 3 * (fromMt2 * (p1y - p0y) + 2 * fromMt * fromT * (p2y - p1y) + fromT2 * (p3y - p2y));
  const d1x = 3 * (toMt2 * (p1x - p0x) + 2 * toMt * toT * (p2x - p1x) + toT2 * (p3x - p2x));
  const d1y = 3 * (toMt2 * (p1y - p0y) + 2 * toMt * toT * (p2y - p1y) + toT2 * (p3y - p2y));

  const q1x = q0x + (span * d0x) / 3;
  const q1y = q0y + (span * d0y) / 3;
  const q2x = q3x - (span * d1x) / 3;
  const q2y = q3y - (span * d1y) / 3;

  writeXY(out.p0 as XYWritable, q0x, q0y);
  writeXY(out.p1 as XYWritable, q1x, q1y);
  writeXY(out.p2 as XYWritable, q2x, q2y);
  writeXY(out.p3 as XYWritable, q3x, q3y);

  return out;
}
