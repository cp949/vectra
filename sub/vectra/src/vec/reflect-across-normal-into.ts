import { isXYObject, isXYObjectWritable } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYObjectWritable, XYTuple, XYTupleWritable, XYWritable } from '../types';

/**
 * vector를 unit normal에 대해 반사한 벡터를 out에 기록하고 out을 반환한다.
 *
 * `vector - 2 * dot(vector, normal) * normal`. normal은 unit vector 전제 (정규화 없음).
 *
 * @param out 결과를 기록할 writable output
 * @param vector 반사할 벡터
 * @param normal 반사 기준 법선 벡터 (unit vector 전제)
 */
export function reflectAcrossNormalInto<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObjectWritable(out) && isXYObject(vector) && isXYObject(normal)) {
    const vx = vector.x;
    const vy = vector.y;
    const nx = normal.x;
    const ny = normal.y;
    const dot2 = 2 * (vx * nx + vy * ny);
    out.x = vx - dot2 * nx;
    out.y = vy - dot2 * ny;
    return out;
  }

  return reflectAcrossNormalIntoShared(out, vector, normal);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function reflectAcrossNormalIntoShared<Out extends XYWritable>(out: Out, vector: XYInput, normal: XYInput): Out {
  const vx = Array.isArray(vector) ? (vector as XYTuple)[0] : (vector as XYLike).x;
  const vy = Array.isArray(vector) ? (vector as XYTuple)[1] : (vector as XYLike).y;
  const nx = Array.isArray(normal) ? (normal as XYTuple)[0] : (normal as XYLike).x;
  const ny = Array.isArray(normal) ? (normal as XYTuple)[1] : (normal as XYLike).y;

  const dot2 = 2 * (vx * nx + vy * ny);

  if (Array.isArray(out)) {
    (out as XYTupleWritable)[0] = vx - dot2 * nx;
    (out as XYTupleWritable)[1] = vy - dot2 * ny;
  } else {
    (out as XYObjectWritable).x = vx - dot2 * nx;
    (out as XYObjectWritable).y = vy - dot2 * ny;
  }
  return out;
}
