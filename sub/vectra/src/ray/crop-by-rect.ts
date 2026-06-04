import type { RayLike, RectLike, SegmentWritable } from '../types';
import { cropByRectInto } from './crop-by-rect-into';

/**
 * ray를 axis-aligned rect boundary로 crop한 새 bounded segment를 반환한다. crop 실패면 undefined를 반환한다.
 *
 * 대응 `cropByRectInto`와 정책이 같다. ray range `[0, +Infinity)`와 rect 내부 구간의 교집합을
 * bounded segment로 반환한다. ray가 rect 내부에서 시작하면 origin부터 forward exit point까지
 * 반환한다. endpoint 순서는 increasing `t`(forward) 순서다.
 * 실패 조건: zero-direction ray, empty rect, forward range에서 rect와 만나지 않음, clip 길이 0,
 * non-finite 좌표.
 *
 * @param ray crop할 ray
 * @param rect crop 경계 rect (axis-aligned)
 */
export function cropByRect(ray: RayLike, rect: RectLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!cropByRectInto(seed, ray, rect)) return undefined;
  return seed;
}
