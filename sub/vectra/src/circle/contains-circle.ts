import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY } from '../internal/xy';
import type { CircleLike } from '../types';

/**
 * outer circle이 inner circle을 포함하면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. outer와 inner가 경계에서 정확히 내접하면 true이다.
 *
 * outer.radius <= 0이면 empty outer로 간주해 항상 false를 반환한다.
 * inner.radius <= 0이면 empty inner로 간주해 항상 true를 반환한다 (empty circle은 포함됨).
 *
 * @param outer inner circle을 포함하는지 판정할 기준 circle
 * @param inner outer circle에 포함되는지 판정할 circle
 */
export function containsCircle(outer: CircleLike, inner: CircleLike): boolean {
  const ro = readCircleRadius(outer);
  // empty outer는 항상 false
  if (ro <= 0) return false;

  const ri = readCircleRadius(inner);
  // empty inner는 항상 true
  if (ri <= 0) return true;

  const ox = readX(readCircleCenter(outer));
  const oy = readY(readCircleCenter(outer));
  const ix = readX(readCircleCenter(inner));
  const iy = readY(readCircleCenter(inner));

  const dx = ix - ox;
  const dy = iy - oy;
  const centerDist = Math.hypot(dx, dy);

  // closed boundary: outer.radius - inner.radius >= centerDist
  return ro - ri >= centerDist;
}
