import type { Ellipse, EllipseWritable, Point } from '../types/flat-shapes.internal';
import { createZeroEllipse } from '../internal/ellipse';
import { scaleInto } from './scale-into';

/**
 * ellipse의 center와 radii에 non-uniform scale을 적용한 결과를 plain object로 반환한다.
 *
 * cx *= scale.x, cy *= scale.y, rx *= scale.x, ry *= scale.y.
 *
 * @param ellipse scale할 ellipse
 * @param scale x/y 축별 scale 배율
 */
export function scale(ellipse: Ellipse, scale: Point): EllipseWritable {
  return scaleInto(createZeroEllipse(), ellipse, scale);
}
