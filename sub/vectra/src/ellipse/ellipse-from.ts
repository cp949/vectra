import type { EllipseLike, EllipseWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createEllipse } from './create-ellipse';

/**
 * `EllipseLike` source의 center와 반지름을 새 plain object로 복사해 반환한다.
 *
 * @param ellipse 복사할 source ellipse
 */
export function ellipseFrom(ellipse: EllipseLike): EllipseWritable;
/**
 * center와 radiusX/radiusY component로 새 plain ellipse writable을 만든다.
 */
export function ellipseFrom(center: XYInput, radiusX: number, radiusY: number): EllipseWritable;
export function ellipseFrom(
  ellipseOrCenter: EllipseLike | XYInput,
  radiusX?: number,
  radiusY?: number
): EllipseWritable {
  if (radiusX === undefined) {
    return copyInto(createEllipse(), ellipseOrCenter as EllipseLike);
  }
  return copyInto(createEllipse(), ellipseOrCenter as XYInput, radiusX, radiusY as number);
}
