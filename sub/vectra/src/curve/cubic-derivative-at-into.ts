import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve의 파라미터 t 위치 1차 도함수(velocity) vector를 out에 기록하고 out을 반환한다.
 *
 * 수식: B'(t) = 3[(1-t)²·(p1-p0) + 2(1-t)t·(p2-p1) + t²·(p3-p2)]
 * t는 clamp 없이 수식 그대로 계산한다.
 * 결과는 정규화되지 않은 raw derivative vector다.
 *
 * @param out derivative vector를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicDerivativeAtInto<Out extends XYWritable>(
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
  const t2 = t * t;
  const twoMtT = 2 * mt * t;

  return writeXY(
    out,
    3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x)),
    3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y))
  );
}
