import { createSegment } from '../segment/create-segment';
import type { PolygonLike, SegmentWritable } from '../types';
import { edgeAtInto } from './edge-at-into';

/**
 * edgeAtInto의 allocating companion.
 *
 * invalid index(음수, 범위 초과, NaN, ±Infinity, 비정수 finite number)에서는 undefined를 반환한다.
 * 마지막 edge(index === pointCount - 1)는 마지막 point → 첫 point segment다.
 */
export function edgeAt(polygon: PolygonLike, index: number): SegmentWritable | undefined {
  const seed = createSegment();
  if (!edgeAtInto(seed, polygon, index)) return undefined;
  return seed;
}
