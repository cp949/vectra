import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';

/**
 * a에서 b를 뺀 벡터를 out에 기록하고 out을 반환한다.
 *
 * a 또는 b가 out과 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param a 피감산 벡터
 * @param b 감산 벡터
 */
export function subInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(a) && isXYObject(b)) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    out.x = x;
    out.y = y;
    return out;
  }

  return subIntoShared(out, a, b);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function subIntoShared<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput): Out {
  const ax = Array.isArray(a) ? (a as XYTuple)[0] : (a as XYLike).x;
  const ay = Array.isArray(a) ? (a as XYTuple)[1] : (a as XYLike).y;
  const bx = Array.isArray(b) ? (b as XYTuple)[0] : (b as XYLike).x;
  const by = Array.isArray(b) ? (b as XYTuple)[1] : (b as XYLike).y;
  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = ax - bx;
    (out as XYTupleWritable)[1] = ay - by;
  } else {
    (out as XYObjectWritable).x = ax - bx;
    (out as XYObjectWritable).y = ay - by;
  }
  return out;
}
