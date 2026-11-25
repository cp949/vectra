import { isXYObject } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYTuple } from '../types';

/**
 * a와 b의 dot product를 반환한다.
 *
 * @param a dot product의 첫 번째 벡터
 * @param b dot product의 두 번째 벡터
 */
export function dot(a: XYInput, b: XYInput): number {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObject(a) && isXYObject(b)) {
    return a.x * b.x + a.y * b.y;
  }

  return dotShared(a, b);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function dotShared(a: XYInput, b: XYInput): number {
  return (
    (Array.isArray(a) ? (a as XYTuple)[0] : (a as XYLike).x) *
      (Array.isArray(b) ? (b as XYTuple)[0] : (b as XYLike).x) +
    (Array.isArray(a) ? (a as XYTuple)[1] : (a as XYLike).y) * (Array.isArray(b) ? (b as XYTuple)[1] : (b as XYLike).y)
  );
}
