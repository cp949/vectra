import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';

/**
 * a에서 b * scalar를 뺀 벡터를 out에 기록하고 out을 반환한다.
 *
 * b를 먼저 scalar로 곱한 뒤 a에서 뺀다.
 * out이 a 또는 b와 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 기준 벡터
 * @param b scalar를 곱한 뒤 뺄 벡터
 * @param scalar b에 곱할 스칼라값
 */
export function subtractScaledInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, scalar: number): Out {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(a) && isXYObject(b)) {
    const x = a.x - b.x * scalar;
    const y = a.y - b.y * scalar;
    out.x = x;
    out.y = y;
    return out;
  }

  return subtractScaledIntoShared(out, a, b, scalar);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function subtractScaledIntoShared<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, scalar: number): Out {
  const ax = Array.isArray(a) ? (a as XYTuple)[0] : (a as XYLike).x;
  const ay = Array.isArray(a) ? (a as XYTuple)[1] : (a as XYLike).y;
  const bx = Array.isArray(b) ? (b as XYTuple)[0] : (b as XYLike).x;
  const by = Array.isArray(b) ? (b as XYTuple)[1] : (b as XYLike).y;
  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = ax - bx * scalar;
    (out as XYTupleWritable)[1] = ay - by * scalar;
  } else {
    (out as XYObjectWritable).x = ax - bx * scalar;
    (out as XYObjectWritable).y = ay - by * scalar;
  }
  return out;
}
