import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';

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
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(input)) {
    const x = input.x * scalar;
    const y = input.y * scalar;
    out.x = x;
    out.y = y;
    return out;
  }

  return scaleIntoShared(out, input, scalar);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function scaleIntoShared<Out extends XYWritable>(out: Out, input: XYInput, scalar: number): Out {
  const x = Array.isArray(input) ? (input as XYTuple)[0] : (input as XYLike).x;
  const y = Array.isArray(input) ? (input as XYTuple)[1] : (input as XYLike).y;
  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = x * scalar;
    (out as XYTupleWritable)[1] = y * scalar;
  } else {
    (out as XYObjectWritable).x = x * scalar;
    (out as XYObjectWritable).y = y * scalar;
  }
  return out;
}
