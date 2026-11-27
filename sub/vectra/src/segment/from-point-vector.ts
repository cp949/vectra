import { createZeroSegment } from '../internal/segment';
import type { Point, SegmentWritable } from '../types/flat-shapes.internal';
import { fromPointVectorInto } from './from-point-vector-into';

/**
 * origin에서 vec 방향으로 이동한 endpoint를 새 plain object로 반환한다.
 *
 * a = origin, b = origin + vec.
 * vec = (0, 0)이면 zero-length segment를 반환한다.
 * NaN/Infinity 입력은 별도 검증 없이 JavaScript 산술 결과를 따른다.
 *
 * @param origin 시작점
 * @param vec 방향 벡터. 끝점에 origin + vec를 기록한다
 */
export function fromPointVector(origin: Point, vec: Point): SegmentWritable {
  return fromPointVectorInto(createZeroSegment(), origin, vec);
}
