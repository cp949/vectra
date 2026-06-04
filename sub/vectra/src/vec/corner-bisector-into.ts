import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * corner a -> b -> c에서 vertex b의 내각 이등분 단위 벡터를 out에 기록하고 out을 반환한다.
 *
 * b에서 a로 향하는 단위 방향과 b에서 c로 향하는 단위 방향의 합을 정규화한 방향이다.
 *
 * 다음 경우 bisector가 정의되지 않으므로 false를 반환하고 out을 수정하지 않는다.
 * - |a - b| === 0 또는 |c - b| === 0 (zero-length edge).
 * - 두 edge가 정확히 반대 방향이라 단위 방향 합이 zero vector (straight line, bisector 미정의).
 *
 * 모든 source 성분을 local로 먼저 읽고 성공 판정 후에만 out에 기록하므로 out이 a / b / c와 같은
 * storage여도 안전하고, 실패 시 out 미수정이 보장된다.
 * non-finite(NaN, Infinity, -Infinity) 입력 검증은 caller 책임이며, 검증 없이 JS 산술 결과를 그대로 기록한다.
 *
 * @param out 결과 단위 벡터를 기록할 writable output
 * @param a corner 한쪽 끝점
 * @param b corner vertex
 * @param c corner 다른쪽 끝점
 * @returns out 또는 false(degenerate)
 */
export function cornerBisectorInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, c: XYInput): Out | false {
  const bx = readX(b);
  const by = readY(b);
  const e1x = readX(a) - bx;
  const e1y = readY(a) - by;
  const len1 = Math.hypot(e1x, e1y);
  if (len1 === 0) return false;

  const e2x = readX(c) - bx;
  const e2y = readY(c) - by;
  const len2 = Math.hypot(e2x, e2y);
  if (len2 === 0) return false;

  const sx = e1x / len1 + e2x / len2;
  const sy = e1y / len1 + e2y / len2;
  const sl = Math.hypot(sx, sy);
  if (sl === 0) return false;

  return writeXY(out, sx / sl, sy / sl);
}
