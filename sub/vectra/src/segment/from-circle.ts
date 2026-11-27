import { createZeroSegment } from '../internal/segment';
import type { Circle, SegmentWritable } from '../types/flat-shapes.internal';
import { fromCircleInto } from './from-circle-into';

/**
 * circle의 diameter segment를 angle 방향으로 새 plain object로 반환한다.
 *
 * direction = (cos(angle), sin(angle)).
 * radius > 0이면 a = center - direction * radius, b = center + direction * radius.
 * radius <= 0이면 zero-length segment a = b = center를 반환한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 *
 * @param circle diameter의 기준이 되는 circle input
 * @param angle diameter 방향각(radian). 기본값 0은 horizontal diameter
 */
export function fromCircle(circle: Circle, angle = 0): SegmentWritable {
  return fromCircleInto(createZeroSegment(), circle, angle);
}
