import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * input에 scalar를 곱한 벡터를 out에 기록하고 out을 반환한다.
 *
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 배율을 적용할 입력 벡터
 * @param scalar 각 성분에 곱할 스칼라 값
 */
export function scaleInto<Out extends XYWritable>(out: Out, input: XYInput, scalar: number): Out {
  return writeXY(out, readX(input) * scalar, readY(input) * scalar);
}
