import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';

/**
 * vector를 normal에 대해 반사한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - 2 * dot(vector, normal) / lengthSq(normal) * normal`. normal은 임의 길이다.
 * `lengthSq(normal) === 0`이면 vector를 그대로 out에 복사한다.
 * input과 out이 같은 object여도 안전하다.
 * non-finite 입력은 검증 없이 pass through한다.
 *
 * @param out 결과를 기록할 writable output
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (임의 길이)
 */
export function reflectInto<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(vector) && isXYObject(normal)) {
    const vx = vector.x;
    const vy = vector.y;
    const nx = normal.x;
    const ny = normal.y;
    const lsq = nx * nx + ny * ny;
    if (lsq === 0) {
      out.x = vx;
      out.y = vy;
    } else {
      const scale = (2 * (vx * nx + vy * ny)) / lsq;
      out.x = vx - scale * nx;
      out.y = vy - scale * ny;
    }
    return out;
  }

  return reflectIntoShared(out, vector, normal);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function reflectIntoShared<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  const vx = Array.isArray(vector) ? (vector as XYTuple)[0] : (vector as XYLike).x;
  const vy = Array.isArray(vector) ? (vector as XYTuple)[1] : (vector as XYLike).y;
  const nx = Array.isArray(normal) ? (normal as XYTuple)[0] : (normal as XYLike).x;
  const ny = Array.isArray(normal) ? (normal as XYTuple)[1] : (normal as XYLike).y;
  const lsq = nx * nx + ny * ny;
  const zero = lsq === 0;
  const scale = zero ? 0 : (2 * (vx * nx + vy * ny)) / lsq;
  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = zero ? vx : vx - scale * nx;
    (out as XYTupleWritable)[1] = zero ? vy : vy - scale * ny;
  } else {
    (out as XYObjectWritable).x = zero ? vx : vx - scale * nx;
    (out as XYObjectWritable).y = zero ? vy : vy - scale * ny;
  }
  return out;
}
