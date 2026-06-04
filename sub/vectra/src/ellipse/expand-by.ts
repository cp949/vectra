import type { EllipseLike, EllipseWritable } from '../types';
import { createEllipse } from './create-ellipse';
import { expandByInto } from './expand-by-into';

/**
 * ellipse를 각 반지름 방향으로 delta만큼 확장(또는 축소)한 결과를 plain object로 반환한다.
 *
 * radiusX += delta, radiusY += delta. center는 변경하지 않는다.
 * 결과 radius가 음수이면 0으로 clamp한다. 음수 delta 허용.
 *
 * @param ellipse 확장할 ellipse
 * @param delta 각 반지름에 더할 값 (음수 허용)
 */
export function expandBy(ellipse: EllipseLike, delta: number): EllipseWritable {
  return expandByInto(createEllipse(), ellipse, delta);
}
