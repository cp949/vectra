import type { RayLike, RayWritable } from '../types';
import { reverseInto } from './reverse-into';

/**
 * 같은 방향을 반대 방향으로 순회하도록 `direction`을 부호 반전한 새 plain object를 반환한다.
 *
 * `reverseInto`에 위임하는 companion wrapper다.
 */
export function reverse(ray: RayLike): RayWritable {
  return reverseInto({ origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } }, ray);
}
