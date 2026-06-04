import type { SegmentWritable, XYInput } from '../types';
import { createSegment } from './create-segment';
import { fromMidpointAngleLengthInto } from './from-midpoint-angle-length-into';

/**
 * midpoint를 중심으로 angle 방향을 따라 length 길이의 segment를 새 plain object로 반환한다.
 *
 * direction = (cos(angle), sin(angle)), half = length / 2.
 * a = midpoint - direction * half, b = midpoint + direction * half.
 * length = 0이면 midpoint에 zero-length segment를 반환한다.
 * negative length는 clamp하지 않는다. endpoint가 angle 반대 방향으로 뒤집히는 JavaScript 산술 결과를 따른다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다. angle = Infinity이면 cos/sin 결과가 NaN이다.
 *
 * @param midpoint segment 중심점
 * @param angle segment 방향각(radian)
 * @param length segment 전체 길이. 0이면 midpoint zero-length segment를 반환한다. 음수는 clamp하지 않는다
 */
export function fromMidpointAngleLength(midpoint: XYInput, angle: number, length: number): SegmentWritable {
  return fromMidpointAngleLengthInto(createSegment(), midpoint, angle, length);
}
