/**
 * 좌표 input이 배열이 아닌 object인지 판별하는 guard.
 *
 * vec의 산술 함수가 object 입력만 받았을 때 field를 함수 안에서 직접 읽는 경로를 고르는 데 쓴다.
 * 공유 `readX`/`readY`는 라이브러리 전체가 feedback을 공유해 `input.x` 인라인 캐시가 여러 모양을 본다.
 * 이 guard를 쓰는 함수는 field를 자기 본문에서 읽으므로 캐시에는 그 함수가 받은 object 모양만 남는다.
 *
 * - `Array.isArray`는 인라인 캐시를 쓰지 않는다. 이 module을 공유해도 feedback이 섞이지 않는다.
 * - 배열이 하나라도 있으면 호출한 함수는 공유 reader 경로로 간다. 입력 해석은 공유 reader와 같다.
 * - x field를 가진 배열도 tuple로 취급한다.
 */

import type { XYInput, XYLike, XYObjectWritable, XYWritable } from '../types';

/** input이 배열이 아니면 true를 반환한다. */
export function isXYObject(input: XYInput): input is XYLike {
  return !Array.isArray(input);
}

/** out이 배열이 아니면 true를 반환한다. */
export function isXYObjectWritable(out: XYWritable): out is XYObjectWritable {
  return !Array.isArray(out);
}
