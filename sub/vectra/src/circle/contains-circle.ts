import type { Circle } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * outer circle이 inner circle을 포함하면 true를 반환한다.
 *
 * 포함 판정은 closed boundary 기준이다. outer와 inner가 경계에서 정확히 내접하면 true이다.
 *
 * outer.r <= 0이면 empty outer로 간주해 항상 false를 반환한다.
 * inner.r <= 0이면 empty inner로 간주해 항상 true를 반환한다 (empty circle은 포함됨).
 *
 * @param outer inner circle을 포함하는지 판정할 기준 circle
 * @param inner outer circle에 포함되는지 판정할 circle
 */
export function containsCircle(outer: Circle, inner: Circle): boolean {
  const ro = outer.r;
  // empty outer는 항상 false
  if (ro <= 0) return false;

  const ri = inner.r;
  // empty inner는 항상 true
  if (ri <= 0) return true;

  const ox = outer.cx;
  const oy = outer.cy;
  const ix = inner.cx;
  const iy = inner.cy;

  const dx = ix - ox;
  const dy = iy - oy;
  const centerDist = hypot2(dx, dy);

  // closed boundary: outer.r - inner.r >= centerDist
  return ro - ri >= centerDist;
}
