import { readX, readY, writeXY } from '../internal/xy';
import type { CubicCurveWritable, XYInput, XYWritable } from '../types';

/**
 * quadratic Bezier curve를 동등한 cubic Bezier curve로 정확하게 변환하여 out에 기록하고 out을 반환한다.
 *
 * degree elevation 공식:
 * ```
 * c0 = p0
 * c1 = p0 + (2/3)*(p1 - p0)
 * c2 = p2 + (2/3)*(p1 - p2)
 * c3 = p2
 * ```
 *
 * aliasing 안전: 입력을 모두 읽은 후 출력에 기록한다.
 * 변환 후 cubic curve는 원본 quadratic curve와 모든 파라미터 t에서 동일한 point를 반환한다.
 *
 * @param out 결과를 기록할 cubic curve writable output
 * @param p0 quadratic curve 시작점
 * @param p1 quadratic curve 제어점
 * @param p2 quadratic curve 끝점
 */
export function quadraticElevateToCubicInto<Out extends CubicCurveWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput
): Out {
  // aliasing 안전을 위해 입력을 모두 먼저 읽는다
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  // degree elevation: quadratic → cubic
  const c1x = p0x + (2 / 3) * (p1x - p0x);
  const c1y = p0y + (2 / 3) * (p1y - p0y);
  const c2x = p2x + (2 / 3) * (p1x - p2x);
  const c2y = p2y + (2 / 3) * (p1y - p2y);

  writeXY(out.p0 as XYWritable, p0x, p0y);
  writeXY(out.p1 as XYWritable, c1x, c1y);
  writeXY(out.p2 as XYWritable, c2x, c2y);
  writeXY(out.p3 as XYWritable, p2x, p2y);

  return out;
}
