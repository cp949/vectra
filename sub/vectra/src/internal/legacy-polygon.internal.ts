import type { XYInput } from '../types';
import type { PolygonWritable } from '../types/flat-shapes.internal';
import { readX, readY } from './xy';

// v2-migration: intersects-path-{circle,ellipse,triangle,rect,bounds}와 segment-hit-equivalence 시험이 쓴다.
// E-17 경로 교차 전환 때 제거한다.
/** 기존 점 목록을 interleaved polygon으로 변환한다. */
export function flatPolygonFromLegacyPoints(points: readonly XYInput[]): PolygonWritable {
  const polygon: PolygonWritable = [];
  for (const point of points) {
    polygon.push(readX(point), readY(point));
  }
  return polygon;
}
