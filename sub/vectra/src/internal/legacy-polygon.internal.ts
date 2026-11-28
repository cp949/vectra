import type { XYInput } from '../types';
import type { PolygonWritable } from '../types/flat-shapes.internal';
import { readX, readY } from './xy';

/** v2-migration: 기존 점 목록을 interleaved polygon으로 변환한다. E에서 남은 호출처를 전환한 뒤 제거한다. */
export function flatPolygonFromLegacyPoints(points: readonly XYInput[]): PolygonWritable {
  const polygon: PolygonWritable = [];
  for (const point of points) {
    polygon.push(readX(point), readY(point));
  }
  return polygon;
}
