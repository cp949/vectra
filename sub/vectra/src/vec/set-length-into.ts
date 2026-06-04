import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector를 정규화한 뒤 targetLength를 곱한 벡터를 out에 기록하고 out을 반환한다.
 *
 * zero vector는 방향 없이 (0, 0)을 기록한다.
 * caller는 targetLength가 finite non-negative임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param out 결과를 기록할 writable output
 * @param vector 길이를 설정할 벡터
 * @param targetLength 설정할 길이 (finite non-negative 전제)
 */
export function setLengthInto<Out extends XYWritable>(out: Out, vector: XYInput, targetLength: number): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const len = Math.hypot(vx, vy);

  if (len === 0) return writeXY(out, 0, 0);

  const s = targetLength / len;
  return writeXY(out, vx * s, vy * s);
}
