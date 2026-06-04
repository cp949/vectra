import type { BoundsLike } from '../types';
import { cornersInto } from './corners-into';

/**
 * bounds의 4개 corner point를 새 배열로 반환한다.
 *
 * `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새 `{ x, y }` object를 담은
 * 배열을 반환한다. 반환 배열 길이는 항상 4이다.
 *
 * empty/inverted bounds와 sentinel bounds에서도 raw 좌표로 4개 point를 반환한다.
 * caller가 미리 `isEmpty`로 거른다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `cornersInto`와 동일하다.
 * @param bounds corner를 읽을 bounds
 */
export function corners(bounds: BoundsLike): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  cornersInto(out, bounds);
  return out;
}
