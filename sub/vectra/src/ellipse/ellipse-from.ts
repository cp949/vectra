import { createZeroEllipse } from '../internal/ellipse';
import type { Ellipse, EllipseWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';

/**
 * `Ellipse` source의 center와 반지름을 새 plain object로 복사해 반환한다.
 *
 * @param ellipse 복사할 source ellipse
 */
export function ellipseFrom(ellipse: Ellipse): EllipseWritable {
  return copyInto(createZeroEllipse(), ellipse);
}
