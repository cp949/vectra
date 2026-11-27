import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * vector를 정규화한 뒤 targetLength를 곱한 벡터를 out에 기록하고 out을 반환한다.
 *
 * zero vector는 방향 없이 (0, 0)을 기록한다.
 * caller는 targetLength가 finite non-negative임을 보장해야 한다.
 * precondition 위반 결과는 정의되지 않는다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 JavaScript 연산 결과 그대로 흐른다.
 *
 * @param out 결과를 기록할 점 객체
 * @param vector 길이를 설정할 벡터
 * @param targetLength 설정할 길이 (finite non-negative 전제)
 */
export function setLengthInto<Out extends PointWritable>(out: Out, vector: Point, targetLength: number): Out {
  const vx = vector.x;
  const vy = vector.y;
  const len = hypot2(vx, vy);

  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  const s = targetLength / len;
  out.x = vx * s;
  out.y = vy * s;
  return out;
}
