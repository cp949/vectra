import type { XYInput, XYObjectWritable } from '../types';
import { pointOnRayInto } from './point-on-ray-into';

/**
 * origin에서 normalize(direction) * distance 위치의 점을 새 object로 반환한다.
 *
 * zero-length direction이면 undefined를 반환한다.
 *
 * @param origin ray 기준점
 * @param direction ray 방향 벡터
 * @param distance 이동 거리
 */
export function pointOnRay(origin: XYInput, direction: XYInput, distance: number): XYObjectWritable | undefined {
  const out = { x: 0, y: 0 };
  const result = pointOnRayInto(out, origin, direction, distance);
  return result === false ? undefined : out;
}
