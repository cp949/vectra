import type { EllipseLike, EllipseWritable, XYInput } from '../types';
import { createEllipse } from './create-ellipse';
import { translateInto } from './translate-into';

/**
 * ellipse의 center를 offset만큼 평행 이동한 결과를 plain object로 반환한다.
 *
 * radii는 그대로 복사한다.
 *
 * @param ellipse 이동할 ellipse
 * @param offset center에 더할 이동 벡터
 */
export function translate(ellipse: EllipseLike, offset: XYInput): EllipseWritable {
  return translateInto(createEllipse(), ellipse, offset);
}
