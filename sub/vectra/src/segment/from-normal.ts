import type { SegmentLike, SegmentWritable } from '../types';
import { createSegment } from './create-segment';
import { fromNormalInto } from './from-normal-into';

/**
 * segment 위 t 위치에서 left normal 방향으로 length만큼 연장한 segment를 새 plain object로 반환한다.
 *
 * a = pointAtT(segment, t) (unclamped). b = a + normal * length.
 * 기준 segment가 zero-length이면 normal 방향이 없으므로 a = b = pointAtT(segment, t)를 반환한다.
 * negative length는 clamp하지 않는다. right normal 방향으로 endpoint가 뒤집히는 JavaScript 산술 결과를 따른다.
 * t는 clamp하지 않는다. t < 0 또는 t > 1은 supporting line 위 extrapolation이다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 *
 * @param segment 기준 segment. t 위치와 normal 방향의 기준
 * @param t parametric 위치. clamp하지 않는다
 * @param length normal 방향 연장 길이. 음수는 right normal 방향. clamp하지 않는다
 */
export function fromNormal(segment: SegmentLike, t: number, length: number): SegmentWritable {
  return fromNormalInto(createSegment(), segment, t, length);
}
