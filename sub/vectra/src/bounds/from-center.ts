import type { BoundsWritable, XYInput } from '../types';
import { createBounds } from './create-bounds';
import { fromCenterInto } from './from-center-into';

/**
 * center와 size로 정의하는 bounds를 새 plain bounds object로 반환한다.
 *
 * min = center - size / 2, max = center + size / 2.
 * size.x/size.y를 width/height로 해석한다. 음수 size는 정규화하지 않는다.
 * 결과가 inverted이면 empty bounds가 된다.
 *
 * non-finite 좌표는 검증하지 않는다. NaN 입력은 NaN으로 전파된다.
 *
 * @param center bounds 중심 좌표
 * @param size bounds의 width/height를 담은 XYInput (x=width, y=height)
 */
export function fromCenter(center: XYInput, size: XYInput): BoundsWritable {
  return fromCenterInto(createBounds(), center, size);
}
