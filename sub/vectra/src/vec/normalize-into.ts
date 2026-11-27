import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';
import { hypot2 } from '../internal/numeric';

/**
 * input 벡터를 정규화하여 out에 기록하고 out을 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 (0, 0)을 기록한다.
 * input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 writable output
 * @param input 정규화할 입력 벡터
 */
export function normalizeInto<Out extends XYWritable>(out: Out, input: XYInput): Out {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(input)) {
    const ix = input.x;
    const iy = input.y;
    const len = hypot2(ix, iy);
    if (len === 0) {
      out.x = 0;
      out.y = 0;
    } else {
      out.x = ix / len;
      out.y = iy / len;
    }
    return out;
  }

  return normalizeIntoShared(out, input);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function normalizeIntoShared<Out extends XYWritable>(out: Out, input: XYInput): Out {
  const x = Array.isArray(input) ? (input as XYTuple)[0] : (input as XYLike).x;
  const y = Array.isArray(input) ? (input as XYTuple)[1] : (input as XYLike).y;
  const len = hypot2(x, y);
  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = len === 0 ? 0 : x / len;
    (out as XYTupleWritable)[1] = len === 0 ? 0 : y / len;
  } else {
    (out as XYObjectWritable).x = len === 0 ? 0 : x / len;
    (out as XYObjectWritable).y = len === 0 ? 0 : y / len;
  }
  return out;
}
