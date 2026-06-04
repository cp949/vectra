import type { CircleLike, RayLike, SegmentWritable } from '../types';
import { cropByCircleInto } from './crop-by-circle-into';

/**
 * ray를 circle boundary로 crop한 새 bounded segment를 반환한다. crop 실패면 undefined를 반환한다.
 *
 * 대응 `cropByCircleInto`와 정책이 같다. ray range `[0, +Infinity)`와 disk 내부 구간의 교집합을
 * bounded segment로 반환한다. ray가 disk 내부에서 시작하면 origin부터 forward exit point까지
 * 반환한다. endpoint 순서는 increasing `t`(forward) 순서다.
 * 실패 조건: zero-direction(degenerate) ray, circle radius가 finite positive 아님, forward range에서
 * disk와 만나지 않음, tangent(clip 길이 0), non-finite 좌표.
 *
 * @param ray crop할 ray
 * @param circle crop 경계 circle
 */
export function cropByCircle(ray: RayLike, circle: CircleLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!cropByCircleInto(seed, ray, circle)) return undefined;
  return seed;
}
