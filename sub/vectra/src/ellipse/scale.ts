import type { EllipseLike, EllipseWritable, XYInput } from '../types';
import { createEllipse } from './create-ellipse';
import { scaleInto } from './scale-into';

/**
 * ellipse의 center와 radii에 non-uniform scale을 적용한 결과를 plain object로 반환한다.
 *
 * center.x *= scale.x, center.y *= scale.y, radiusX *= scale.x, radiusY *= scale.y.
 *
 * @param ellipse scale할 ellipse
 * @param scale x/y 축별 scale 배율
 */
export function scale(ellipse: EllipseLike, scale: XYInput): EllipseWritable {
  return scaleInto(createEllipse(), ellipse, scale);
}
