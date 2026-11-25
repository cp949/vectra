/**
 * `intersectsSegmentSegment`, `intersectsPolygonSegment`, `intersectsCircleSegment` 전용 입력 읽기 helper.
 *
 * `readX`/`readY`와 shape reader는 라이브러리 전체가 공유한다. 공유 함수의 `input.x` 인라인 캐시는 호출자마다 다른 입력 모양을 본다.
 * 이 module의 함수는 위 세 함수와 polygon×line-family 판정(`polygon-line-family-hit.internal`)만 호출한다.
 * 캐시에는 이 판정들이 받는 입력 모양만 남는다.
 *
 * - tuple 판별은 공유 reader와 같다. `Array.isArray`를 먼저 판별하고 tuple이 field를 가져도 tuple로 취급한다.
 * - field 우선 읽기는 쓰지 않는다. 같은 함수를 객체와 tuple로 섞어 부르면 field 우선 읽기가 더 느리다.
 * - 새 reader는 위 판정에만 추가한다. 다른 함수에서 호출하지 않는다.
 *
 * 또 segment 두 점을 담는 `LineFamilyParam` record를 호출마다 만들지 않으려고 재사용 record를 둔다.
 * `lineFamilyIntersects`와 `lineFamilyCircleIntersects`는 param을 보관하지 않고 호출은 동기이므로 재사용해도 안전하다.
 */

import type { CircleLike, CircleTuple, SegmentLike, SegmentTuple, XYInput, XYLike, XYTuple } from '../types';
import type { LineFamilyParam } from './line-family-param.internal';

/** point x를 읽는다. */
export function lineHitX(input: XYInput): number {
  return Array.isArray(input) ? (input as XYTuple)[0] : (input as XYLike).x;
}

/** point y를 읽는다. */
export function lineHitY(input: XYInput): number {
  return Array.isArray(input) ? (input as XYTuple)[1] : (input as XYLike).y;
}

/** segment 시작점을 읽는다. */
export function lineHitSegmentA(segment: SegmentLike): XYInput {
  return Array.isArray(segment) ? (segment as SegmentTuple)[0] : (segment as Exclude<SegmentLike, SegmentTuple>).a;
}

/** segment 끝점을 읽는다. */
export function lineHitSegmentB(segment: SegmentLike): XYInput {
  return Array.isArray(segment) ? (segment as SegmentTuple)[1] : (segment as Exclude<SegmentLike, SegmentTuple>).b;
}

/** circle 중심을 읽는다. */
export function lineHitCircleCenter(circle: CircleLike): XYInput {
  return Array.isArray(circle) ? (circle as CircleTuple)[0] : (circle as Exclude<CircleLike, CircleTuple>).center;
}

/** circle 반지름을 읽는다. */
export function lineHitCircleRadius(circle: CircleLike): number {
  return Array.isArray(circle) ? (circle as CircleTuple)[1] : (circle as Exclude<CircleLike, CircleTuple>).radius;
}

/** 첫 번째 segment 판정에 쓰는 재사용 param이다. */
export const lineHitParamA: LineFamilyParam = { ox: 0, oy: 0, dx: 0, dy: 0, kind: 'finite' };

/** 두 번째 segment 판정에 쓰는 재사용 param이다. */
export const lineHitParamB: LineFamilyParam = { ox: 0, oy: 0, dx: 0, dy: 0, kind: 'finite' };

/**
 * `param`을 segment (ax, ay)→(bx, by)로 채워 반환한다.
 *
 * `segmentToLineFamilyParam`과 같은 값이다. 새 record를 만들지 않는다.
 */
export function fillSegmentParam(
  param: LineFamilyParam,
  ax: number,
  ay: number,
  bx: number,
  by: number
): LineFamilyParam {
  param.ox = ax;
  param.oy = ay;
  param.dx = bx - ax;
  param.dy = by - ay;
  return param;
}
