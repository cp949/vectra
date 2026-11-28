/**
 * ray*HitT 전용 입력 읽기 helper.
 *
 * `readX`/`readY`와 shape reader는 라이브러리 전체가 공유한다.
 * 공유 함수의 `input.x` 인라인 캐시는 호출자마다 다른 입력 모양을 모두 본다.
 * 공유 함수가 여러 모양을 보면 field 우선 읽기가 느려지므로 공유 reader는 `Array.isArray`를 먼저 판별한다.
 * 이 module의 함수는 ray*HitT만 호출한다. 캐시에는 ray*HitT가 받는 입력 모양만 남는다.
 * 그래서 field를 먼저 읽어도 다른 함수의 입력에 오염되지 않는다.
 *
 * - field가 `undefined`가 아니면 그 값을, 아니면 tuple index를 읽는다.
 * - tuple이 field를 함께 가지면 object로 취급한다. 공유 reader는 tuple로 취급한다.
 * - 새 reader는 ray*HitT가 읽는 입력에만 추가한다. 다른 함수에서 호출하지 않는다.
 */

import type { BoundsLike, BoundsTuple, RectLike, RectTuple, XYInput, XYLike, XYTuple } from '../types';

/** point x를 읽는다. */
export function hitX(input: XYInput): number {
  const v = (input as XYLike).x;
  return v !== undefined ? v : (input as XYTuple)[0];
}

/** point y를 읽는다. */
export function hitY(input: XYInput): number {
  const v = (input as XYLike).y;
  return v !== undefined ? v : (input as XYTuple)[1];
}

/** bounds 최소 모서리를 읽는다. */
export function hitBoundsMin(bounds: BoundsLike): XYInput {
  const v = (bounds as Exclude<BoundsLike, BoundsTuple>).min;
  return v !== undefined ? v : (bounds as BoundsTuple)[0];
}

/** bounds 최대 모서리를 읽는다. */
export function hitBoundsMax(bounds: BoundsLike): XYInput {
  const v = (bounds as Exclude<BoundsLike, BoundsTuple>).max;
  return v !== undefined ? v : (bounds as BoundsTuple)[1];
}

/** rect x를 읽는다. */
export function hitRectX(rect: RectLike): number {
  const v = (rect as Exclude<RectLike, RectTuple>).x;
  return v !== undefined ? v : (rect as RectTuple)[0];
}

/** rect y를 읽는다. */
export function hitRectY(rect: RectLike): number {
  const v = (rect as Exclude<RectLike, RectTuple>).y;
  return v !== undefined ? v : (rect as RectTuple)[1];
}

/** rect width를 읽는다. */
export function hitRectWidth(rect: RectLike): number {
  const v = (rect as Exclude<RectLike, RectTuple>).width;
  return v !== undefined ? v : (rect as RectTuple)[2];
}

/** rect height를 읽는다. */
export function hitRectHeight(rect: RectLike): number {
  const v = (rect as Exclude<RectLike, RectTuple>).height;
  return v !== undefined ? v : (rect as RectTuple)[3];
}
