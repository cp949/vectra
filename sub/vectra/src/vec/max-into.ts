import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * a와 b의 각 성분 중 더 큰 값으로 구성된 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 * NaN, Infinity, -Infinity 입력은 Math.max 정책을 따른다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 첫 번째 입력 벡터
 * @param b 두 번째 입력 벡터
 */
export function maxInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  return writeXY(out, Math.max(ax, bx), Math.max(ay, by));
}
