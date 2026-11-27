import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * input 벡터를 정규화하여 out에 기록하고 out을 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input 정규화할 입력 벡터
 */
export function normalizeInto<Out extends PointWritable>(out: Out, input: Point): Out {
  const { x, y } = input;
  const len = hypot2(x, y);
  if (len === 0) {
    out.x = 0;
    out.y = 0;
  } else {
    out.x = x / len;
    out.y = y / len;
  }
  return out;
}
