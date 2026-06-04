import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * cubic Bezier curve의 파라미터 t 위치 unit tangent vector를 out에 기록하고 out을 반환한다.
 *
 * 1차 도함수를 정규화한 unit vector를 반환한다.
 * derivative가 zero vector인 경우(degenerate curve 등) zero vector를 기록한다.
 * caller가 zero vector를 처리할 책임이 있다. vectra는 임의 방향을 주입하지 않는다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out unit tangent vector를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function cubicTangentAtInto<Out extends XYWritable>(
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

  const dx = 3 * (mt2 * (p1x - p0x) + twoMtT * (p2x - p1x) + t2 * (p3x - p2x));
  const dy = 3 * (mt2 * (p1y - p0y) + twoMtT * (p2y - p1y) + t2 * (p3y - p2y));

  const len = Math.hypot(dx, dy);

  if (len === 0) {
    return writeXY(out, 0, 0);
  }

  return writeXY(out, dx / len, dy / len);
}
