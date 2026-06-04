import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * quadratic Bezier curve 위의 파라미터 t 위치 point를 out에 기록하고 out을 반환한다.
 *
 * 수식: B(t) = (1-t)²·p0 + 2(1-t)t·p1 + t²·p2
 * t는 clamp 없이 수식 그대로 계산한다. `t < 0` 또는 `t > 1`이면 외삽(extrapolation) 결과가 된다.
 *
 * @param out point를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticPointAtTInto<Out extends XYWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  t: number
): Out {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const twoMtT = 2 * mt * t;

  return writeXY(out, mt2 * p0x + twoMtT * p1x + t2 * p2x, mt2 * p0y + twoMtT * p1y + t2 * p2y);
}
