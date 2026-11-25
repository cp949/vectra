/**
 * ray input에서 origin·direction 좌표를 scalar로 읽는 internal helper.
 *
 * `readRayOrigin`/`readRayDirection`은 tuple ray에서 배열을 새로 만든다.
 * 반복 호출 hot path는 배열 생성 없이 숫자 네 개를 읽어야 한다.
 * 이 module은 object 필드를 먼저 읽고, 필드가 없으면 tuple index를 읽는다.
 * `origin` 필드를 가진 배열은 object input으로 취급한다.
 * origin·direction의 point 좌표는 ray*HitT 전용 reader(`ray-hit-t-read.internal`)로 읽는다.
 */

import type { RayLike, RayObjectLike, RayTuple } from '../types';
import { hitX, hitY } from './ray-hit-t-read.internal';

/** ray origin x를 읽는다. */
export function readRayOriginX(ray: RayLike): number {
  const origin = (ray as RayObjectLike).origin;
  return origin !== undefined ? hitX(origin) : (ray as RayTuple)[0];
}

/** ray origin y를 읽는다. */
export function readRayOriginY(ray: RayLike): number {
  const origin = (ray as RayObjectLike).origin;
  return origin !== undefined ? hitY(origin) : (ray as RayTuple)[1];
}

/** ray direction x를 읽는다. */
export function readRayDirectionX(ray: RayLike): number {
  const direction = (ray as RayObjectLike).direction;
  return direction !== undefined ? hitX(direction) : (ray as RayTuple)[2];
}

/** ray direction y를 읽는다. */
export function readRayDirectionY(ray: RayLike): number {
  const direction = (ray as RayObjectLike).direction;
  return direction !== undefined ? hitY(direction) : (ray as RayTuple)[3];
}
