import { isXYObject } from '../internal/xy-object.internal';
import type { XYInput, XYLike, XYTuple } from '../types';

/**
 * a와 b 사이 Euclidean 거리의 제곱을 반환한다.
 *
 * @param a 거리를 측정할 첫 번째 점
 * @param b 거리를 측정할 두 번째 점
 */
export function distanceSq(a: XYInput, b: XYInput): number {
  // object 입력만 받았으면 field를 이 함수에서 직접 읽는다
  if (isXYObject(a) && isXYObject(b)) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

  return distanceSqShared(a, b);
}

/** 배열 입력이 있을 때 쓰는 경로. 판별을 이 함수 안에서 직접 해 inlining 비용을 줄인다. */
function distanceSqShared(a: XYInput, b: XYInput): number {
  const dx =
    (Array.isArray(b) ? (b as XYTuple)[0] : (b as XYLike).x) - (Array.isArray(a) ? (a as XYTuple)[0] : (a as XYLike).x);
  const dy =
    (Array.isArray(b) ? (b as XYTuple)[1] : (b as XYLike).y) - (Array.isArray(a) ? (a as XYTuple)[1] : (a as XYLike).y);

  return dx * dx + dy * dy;
}
