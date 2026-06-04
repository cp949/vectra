import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve 위의 파라미터 t 위치 point를 out에 기록하고 out을 반환한다.
 *
 * 수식: B(t) = (1-t)³·p0 + 3(1-t)²t·p1 + 3(1-t)t²·p2 + t³·p3
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out point를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicPointAtTInto<Out extends XYWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  t: number
): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  const threeMt2T = 3 * mt2 * t;
  const threeMtT2 = 3 * mt * t2;

  return writeXY(
    out,
    mt3 * p0x + threeMt2T * p1x + threeMtT2 * p2x + t3 * p3x,
    mt3 * p0y + threeMt2T * p1y + threeMtT2 * p2y + t3 * p3y
  );
}
