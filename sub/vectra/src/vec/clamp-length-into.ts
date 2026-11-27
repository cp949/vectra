import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * vector 길이를 [minLength, maxLength] 범위로 clamp한 벡터를 out에 기록하고 out을 반환한다.
 *
 * zero vector는 방향 없이 (0, 0)을 기록한다.
 * caller는 `0 <= minLength <= maxLength`이고 두 값이 finite임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 길이를 clamp할 벡터
 * @param minLength 최소 길이 (0 이상, maxLength 이하, finite 전제)
 * @param maxLength 최대 길이 (minLength 이상, finite 전제)
 */
export function clampLengthInto<Out extends PointWritable>(
  out: Out,
  vector: Point,
  minLength: number,
  maxLength: number
): Out {
  const vx = vector.x;
  const vy = vector.y;
  const len = hypot2(vx, vy);

  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  if (len < minLength) {
    const s = minLength / len;
    out.x = vx * s;
    out.y = vy * s;
    return out;
  }

  if (len > maxLength) {
    const s = maxLength / len;
    out.x = vx * s;
    out.y = vy * s;
    return out;
  }

  out.x = vx;
  out.y = vy;
  return out;
}
