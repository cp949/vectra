import type { CircleWritable, EllipseLike } from '../types';
import { toCircleInto } from './to-circle-into';

/**
 * `radiusX === radiusY`인 ellipse만 circle로 변환해 새 plain object로 반환한다.
 *
 * 두 radius가 정확히 일치할 때만 성공한다 (`===` 비교, epsilon 없음). 한 ULP라도 다르면 실패.
 * `radiusX === radiusY`가 `0` 또는 같은 음수여도 structural circle을 반환한다.
 * `radiusX !== radiusY` 또는 NaN radii면 `undefined`를 반환한다.
 *
 * @param ellipse circle로 변환할 ellipse
 */
export function toCircle(ellipse: EllipseLike): CircleWritable | undefined {
  const out: CircleWritable = { center: { x: 0, y: 0 }, radius: 0 };
  return toCircleInto(out, ellipse) === false ? undefined : out;
}
