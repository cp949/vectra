import type { RayLike, RayTuple, XYInput } from '../types';

// readonly tuple narrowing은 Array.isArray로 명시한다 (agent trap: readonly-tuple-narrowing)
function isRayTuple(ray: RayLike): ray is RayTuple {
  return Array.isArray(ray);
}

/** ray input에서 origin point를 읽는다. */
export function readRayOrigin(ray: RayLike): XYInput {
  return isRayTuple(ray) ? [ray[0], ray[1]] : ray.origin;
}

/** ray input에서 direction vector를 읽는다. */
export function readRayDirection(ray: RayLike): XYInput {
  return isRayTuple(ray) ? [ray[2], ray[3]] : ray.direction;
}
