import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * input 벡터의 CCW 수직 방향 단위 벡터 (-y, x) 방향을 normalize해서 out에 기록하고 out을 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 out에 기록한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param input CCW normal을 구할 입력 벡터
 */
export function normalLeftInto<Out extends PointWritable>(out: Out, input: Point): Out {
  const x = input.x;
  const y = input.y;
  const nx = -y;
  const ny = x;
  const len = hypot2(nx, ny);

  if (len === 0) {
    out.x = 0;
    out.y = 0;
  } else {
    out.x = nx / len;
    out.y = ny / len;
  }
  return out;
}
