import { isXYObject } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYTuple } from '../types';

/**
 * input 벡터의 Euclidean 길이 제곱을 반환한다.
 *
 * @param input 길이를 측정할 벡터
 */
export function lengthSq(input: XYInput): number {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObject(input)) {
    const x = input.x;
    const y = input.y;
    return x * x + y * y;
  }

  return lengthSqShared(input);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function lengthSqShared(input: XYInput): number {
  const x = Array.isArray(input) ? (input as XYTuple)[0] : (input as XYLike).x;
  const y = Array.isArray(input) ? (input as XYTuple)[1] : (input as XYLike).y;

  return x * x + y * y;
}
