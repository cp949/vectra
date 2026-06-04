import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * vector 길이를 [minLength, maxLength] 범위로 clamp한 벡터를 out에 기록하고 out을 반환한다.
 *
 * zero vector는 방향 없이 (0, 0)을 기록한다.
 * caller는 `0 <= minLength <= maxLength`이고 두 값이 finite임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param out 결과를 기록할 writable output
 * @param vector 길이를 clamp할 벡터
 * @param minLength 최소 길이 (0 이상, maxLength 이하, finite 전제)
 * @param maxLength 최대 길이 (minLength 이상, finite 전제)
 */
export function clampLengthInto<Out extends XYWritable>(
  out: Out,
  vector: XYInput,
  minLength: number,
  maxLength: number
): Out {
  const vx = readX(vector);
  const vy = readY(vector);
  const len = Math.hypot(vx, vy);

  if (len === 0) return writeXY(out, 0, 0);

  if (len < minLength) {
    const s = minLength / len;
    return writeXY(out, vx * s, vy * s);
  }

  if (len > maxLength) {
    const s = maxLength / len;
    return writeXY(out, vx * s, vy * s);
  }

  return writeXY(out, vx, vy);
}
