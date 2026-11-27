import type { Point, PointWritable } from '../types/flat-shapes.internal';
import { hypot2 } from '../internal/numeric';

/**
 * origin에서 normalize(direction) * distance 위치의 점을 out에 기록하고 out을 반환한다.
 *
 * zero-length direction이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 결과를 기록할 점 객체
 * @param origin ray 기준점
 * @param direction ray 방향 벡터 (정규화 없이 사용)
 * @param distance 이동 거리
 */
export function pointOnRayInto<Out extends PointWritable>(
  out: Out,
  origin: Point,
  direction: Point,
  distance: number
): Out | false {
  const dx = direction.x;
  const dy = direction.y;
  const len = hypot2(dx, dy);

  if (len === 0) return false;

  const nx = dx / len;
  const ny = dy / len;

  out.x = origin.x + nx * distance;
  out.y = origin.y + ny * distance;
  return out;
}
