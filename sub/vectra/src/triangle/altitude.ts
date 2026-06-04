import { createSegment } from '../segment/create-segment';
import type { SegmentWritable, TriangleLike } from '../types';
import { altitudeInto } from './altitude-into';

/**
 * altitudeInto의 allocating companion.
 *
 * index vertex에서 맞은편 side로 내린 수선(altitude)을 SegmentWritable로 반환한다.
 * 실패(invalid index, non-finite vertex, zero-length opposite side)는 undefined를 반환한다.
 *
 * @param triangle 수선을 계산할 triangle
 * @param index 수선을 내릴 vertex index (0=A, 1=B, 2=C)
 */
export function altitude(triangle: TriangleLike, index: number): SegmentWritable | undefined {
  const seed = createSegment();
  if (!altitudeInto(seed, triangle, index)) return undefined;
  return seed;
}
