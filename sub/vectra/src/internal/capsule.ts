import type { CapsuleLike, CapsuleTuple, XYInput } from '../types';
import { segmentClosestPointXY } from './segment';

function isCapsuleTuple(capsule: CapsuleLike): capsule is CapsuleTuple {
  return Array.isArray(capsule);
}

/** capsule input에서 axis 시작 endpoint를 읽는다. */
export function readCapsuleA(capsule: CapsuleLike): XYInput {
  return isCapsuleTuple(capsule) ? capsule[0] : capsule.a;
}

/** capsule input에서 axis 끝 endpoint를 읽는다. */
export function readCapsuleB(capsule: CapsuleLike): XYInput {
  return isCapsuleTuple(capsule) ? capsule[1] : capsule.b;
}

/** capsule input에서 radius를 읽는다. */
export function readCapsuleRadius(capsule: CapsuleLike): number {
  return isCapsuleTuple(capsule) ? capsule[2] : capsule.radius;
}

/**
 * capsule radius가 finite non-negative인지 검증하고 그대로 반환한다.
 *
 * `radius < 0`와 non-finite radius(`NaN`, `Infinity`, `-Infinity`)는 `RangeError`다. 모든
 * public capsule query가 같은 실패 정책을 공유하도록 이 helper를 통해 radius를 읽는다.
 *
 * @param radius 검증할 capsule radius
 */
export function validateCapsuleRadius(radius: number): number {
  if (!(radius >= 0) || radius === Infinity) {
    throw new RangeError(`capsule radius must be a finite non-negative number, got ${String(radius)}`);
  }
  return radius;
}

/**
 * point에서 capsule axis segment까지의 squared distance를 반환한다.
 *
 * radius validation 없음. axis 위 closest point를 `segmentClosestPointXY`로 구해 squared
 * distance를 계산한다. zero-axis(`a === b`)는 endpoint까지의 거리다. containment / unsigned
 * distance / closest point가 공유하는 raw-coord kernel이다.
 *
 * @param ax axis 시작점 x
 * @param ay axis 시작점 y
 * @param bx axis 끝점 x
 * @param by axis 끝점 y
 * @param px 기준 point x
 * @param py 기준 point y
 */
export function capsuleAxisDistanceSqXY(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number
): number {
  const q = segmentClosestPointXY(ax, ay, bx, by, px, py);
  const dx = px - q.x;
  const dy = py - q.y;
  return dx * dx + dy * dy;
}

/**
 * point에서 capsule axis segment까지의 distance를 반환한다.
 *
 * `Math.hypot`으로 거리를 계산해 finite 좌표 차이의 제곱 overflow를 피한다. zero-axis(`a === b`)는
 * endpoint까지의 거리다.
 *
 * @param ax axis 시작점 x
 * @param ay axis 시작점 y
 * @param bx axis 끝점 x
 * @param by axis 끝점 y
 * @param px 기준 point x
 * @param py 기준 point y
 */
export function capsuleAxisDistanceXY(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const q = segmentClosestPointXY(ax, ay, bx, by, px, py);
  return Math.hypot(px - q.x, py - q.y);
}
