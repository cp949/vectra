/**
 * rotateHandles — bounds의 rotate handle 좌표 collection을 새 배열로 반환하는 companion.
 */

import type { BoundsLike, XYObjectWritable } from '../types';
import { type RotateHandlesOptions, rotateHandlesInto } from './rotate-handles-into';
import type { HandlePoint } from './types';

/**
 * bounds의 rotate handle 좌표 collection을 새 배열로 반환한다.
 *
 * `rotateHandlesInto`의 allocating companion이다. default factory가 새 plain
 * `{ x, y }` object를 만든다.
 * 단일 `{ id: 'rotate', point }` 원소를 반환한다(future multi-rotate handle 확장을 위해 배열).
 * 위치: top-center 위 `offset`만큼 떨어진 점. offset 기본값 0.
 * unrotated AABB 기준 좌표만 산출한다. rotation 합성은 caller 책임.
 * NaN/Infinity 좌표는 IEEE-754 propagation으로 그대로 담는다.
 * 호출마다 새 배열을 반환한다.
 *
 * @param bounds 대상 unrotated AABB
 * @param options rotate handle 위치 옵션
 * @returns rotate handle 좌표 배열 (항상 1개)
 */
export function rotateHandles(bounds: BoundsLike, options?: RotateHandlesOptions): HandlePoint<XYObjectWritable>[] {
  const out: HandlePoint<XYObjectWritable>[] = [];
  rotateHandlesInto(out, bounds, () => ({ x: 0, y: 0 }), options);
  return out;
}
