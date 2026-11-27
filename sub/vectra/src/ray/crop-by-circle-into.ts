import { cropLineFamilyByCircleInto } from '../internal/line-family-crop';
import type { Circle, Ray, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * ray를 circle boundary로 crop한 bounded segment를 out에 기록하고 성공 여부를 반환한다.
 *
 * ray range `[0, +Infinity)`와 disk 내부 구간의 교집합을 bounded segment로 기록한다. ray가 disk
 * 내부에서 시작하면 origin부터 forward exit point까지 기록한다. backward side hit는 버린다.
 * 성공하면 `out`에 기록하고 `true`, 실패/empty crop이면 `false`이고 `out`을 수정하지 않는다.
 * output segment endpoint 순서는 increasing `t`(forward) 순서다.
 * 실패 조건: zero-direction ray, circle radius가 finite positive 아님, forward range에서 disk와
 * 만나지 않음, tangent(clip 길이 0). non-finite 좌표는 실패한다.
 *
 * @param out 결과를 기록할 선분 객체
 * @param ray crop할 ray
 * @param circle crop 경계 circle
 */
export function cropByCircleInto(out: SegmentWritable, ray: Ray, circle: Circle): boolean {
  const { ox, oy, dx, dy } = ray;
  return cropLineFamilyByCircleInto(out, ox, oy, dx, dy, 'ray', circle.cx, circle.cy, circle.r);
}
