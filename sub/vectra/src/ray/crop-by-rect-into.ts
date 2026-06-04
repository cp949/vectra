import { cropLineFamilyByRectInto } from '../internal/line-family-crop';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RayLike, RectLike, SegmentWritable, XYWritable } from '../types';

/**
 * ray를 axis-aligned rect boundary로 crop한 bounded segment를 out에 기록하고 성공 여부를 반환한다.
 *
 * ray range `[0, +Infinity)`와 rect 내부 구간의 교집합을 bounded segment로 기록한다. ray가 rect
 * 내부에서 시작하면 origin부터 forward exit point까지 기록한다. backward side hit는 버린다.
 * 성공하면 `out`에 기록하고 `true`, 실패/empty crop이면 `false`이고 `out`을 수정하지 않는다.
 * output segment endpoint 순서는 increasing `t`(forward) 순서다.
 * 실패 조건: zero-direction ray, empty rect(`width`/`height`가 `<= 0` 또는 ±Infinity·NaN),
 * forward range에서 rect와 만나지 않음, clip 길이 0. non-finite 좌표는 실패한다.
 *
 * @param out crop된 segment를 기록할 writable output
 * @param ray crop할 ray
 * @param rect crop 경계 rect (axis-aligned)
 */
export function cropByRectInto(out: SegmentWritable<XYWritable, XYWritable>, ray: RayLike, rect: RectLike): boolean {
  const o = readRayOrigin(ray);
  const d = readRayDirection(ray);
  return cropLineFamilyByRectInto(
    out,
    readX(o),
    readY(o),
    readX(d),
    readY(d),
    'ray',
    readRectX(rect),
    readRectY(rect),
    readRectWidth(rect),
    readRectHeight(rect)
  );
}
