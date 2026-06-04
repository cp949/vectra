import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * quadratic Bezier curve의 파라미터 t 위치 unit normal vector를 out에 기록하고 out을 반환한다.
 *
 * unit tangent를 좌측 90도 회전한 벡터 (-ty, tx)를 반환한다.
 * derivative가 zero vector인 경우(degenerate curve 등) zero vector를 기록한다.
 * caller가 zero vector를 처리할 책임이 있다. vectra는 임의 방향을 주입하지 않는다.
 * t는 clamp 없이 수식 그대로 계산한다.
 *
 * @param out unit normal vector를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param t 파라미터 (일반적으로 [0, 1], clamp 없음)
 */
export function quadraticNormalAtInto<Out extends XYWritable>(
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

  const twoMt = 2 * (1 - t);
  const twoT = 2 * t;

  const dx = twoMt * (p1x - p0x) + twoT * (p2x - p1x);
  const dy = twoMt * (p1y - p0y) + twoT * (p2y - p1y);

  const len = Math.hypot(dx, dy);

  if (len === 0) {
    return writeXY(out, 0, 0);
  }

  // tangent의 90도 회전: (-ty, tx)
  return writeXY(out, -dy / len, dx / len);
}
