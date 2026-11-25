/**
 * polygon 넓이·centroid 계산 전용 점 좌표 읽기 helper.
 *
 * `readX`/`readY`는 라이브러리 전체가 공유한다. 공유 함수의 `input.x` 인라인 캐시는 호출자마다 다른 입력 모양을 본다.
 * 이 module의 함수는 `shoelace2x`와 `centroidInto`만 호출한다. 캐시에는 이 계산이 받는 점 모양만 남는다.
 *
 * - tuple 판별은 공유 reader와 같다. `Array.isArray`를 먼저 판별하고 tuple이 field를 가져도 tuple로 취급한다.
 * - field 우선 읽기는 쓰지 않는다. 한 프로세스에서 area 계열을 객체와 tuple로 섞어 부르면 field 우선 읽기가 더 느렸다.
 * - 새 reader는 polygon 넓이·centroid 계산에만 추가한다. 다른 함수에서 호출하지 않는다.
 */

import type { XYInput, XYLike, XYTuple } from '../types';

/** polygon 점의 x를 읽는다. */
export function areaX(input: XYInput): number {
  return Array.isArray(input) ? (input as XYTuple)[0] : (input as XYLike).x;
}

/** polygon 점의 y를 읽는다. */
export function areaY(input: XYInput): number {
  return Array.isArray(input) ? (input as XYTuple)[1] : (input as XYLike).y;
}
