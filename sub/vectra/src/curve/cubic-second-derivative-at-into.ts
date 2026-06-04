import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve의 파라미터 t 위치 2차 도함수(acceleration) vector를 out에 기록하고 out을 반환한다.
 *
 * 수식: B''(t) = 6[(1-t)·(p2-2p1+p0) + t·(p3-2p2+p1)]
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out 2차 도함수 vector를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicSecondDerivativeAtInto<Out extends XYWritable>(
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

  return writeXY(
    out,
    6 * (mt * (p2x - 2 * p1x + p0x) + t * (p3x - 2 * p2x + p1x)),
    6 * (mt * (p2y - 2 * p1y + p0y) + t * (p3y - 2 * p2y + p1y))
  );
}
