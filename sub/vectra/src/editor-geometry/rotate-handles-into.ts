/**
 * rotateHandlesInto — bounds의 rotate handle 좌표를 out 배열에 기록한다.
 */

import type { Bounds, PointWritable } from '../types/flat-shapes.internal';
import { boundsWithMidpoint } from './handle-position.internal';
import type { HandlePoint } from './types';

/** rotateHandlesInto 옵션. 옵션 객체를 생략하면 offset 0을 쓴다. */
export interface RotateHandlesOptions {
  /**
   * top-center에서 위(-y 방향)로 떨어진 pixel offset.
   *
   * 0이면 top edge(minY) 위다. 양수일수록 bounds 위로 멀어진다.
   */
  offset: number;
}

/**
 * bounds의 rotate handle 좌표를 out 배열에 기록한다.
 *
 * 단일 handle만 산출하지만 future multi-rotate handle 확장을 위해
 * collection Into 시그니처를 유지한다.
 * 위치: top-center 위 `offset`만큼 떨어진 점. 옵션을 생략하면 offset은 0이다.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * 호출 시 항상 `out.length = 0`으로 초기화한 뒤 push한다.
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 기록한다.
 *
 * @param out handle 좌표를 기록할 출력 배열 { id, point }[]
 * @param bounds 대상 unrotated AABB
 * @param factory caller가 공급하는 Point 인스턴스 생성 함수
 * @param options rotate handle 위치 옵션
 * @returns 기록된 handle 수 (항상 1)
 */
export function rotateHandlesInto(
  out: HandlePoint[],
  bounds: Bounds,
  factory: () => PointWritable,
  options?: RotateHandlesOptions
): number {
  out.length = 0;

  const { minY, midX } = boundsWithMidpoint(bounds);
  const offset = options === undefined ? 0 : options.offset;

  const point = factory();
  // top-center 위 offset만큼 위(-y 방향)에 위치한다
  point.x = midX;
  point.y = minY - offset;
  out.push({ id: 'rotate', point });

  return out.length;
}
