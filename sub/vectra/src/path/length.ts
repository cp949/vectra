import { polylineTotalLength } from '../internal/polyline';
import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';
import { createSegmentFlattener } from './segment-flattener.internal';

/**
 * path commands의 총 arc-length를 반환한다.
 *
 * 내부적으로 drawing segment별로 arc-length를 합산한다.
 * MoveCommand는 arc-length에 기여하지 않으므로 다중 subpath 간 gap은 포함되지 않는다.
 * empty path, move-only path는 0을 반환한다.
 *
 * @param commands arc-length를 계산할 path command sequence
 * @param options flatten 허용 오차와 subdivision 깊이 상한
 * @returns path의 총 arc-length (단위: 좌표 단위)
 */
export function length(commands: readonly PathCommand[], options?: PathMeasurementOptions): number {
  const flattener = createSegmentFlattener(options);

  let total = 0;

  forEachDrawSegment(commands, (seg) => {
    if (seg.kind === 'line') {
      // line segment: 두 endpoint 사이 유클리드 거리
      total += Math.hypot(seg.command.x - seg.fromX, seg.command.y - seg.fromY);
    } else if (seg.kind === 'close') {
      // close segment: current → subpath start 사이 유클리드 거리
      total += Math.hypot(seg.subpathStartX - seg.fromX, seg.subpathStartY - seg.fromY);
    } else {
      // 곡선: flatten한 polyline의 길이
      total += polylineTotalLength(flattener.flatten(seg));
    }
  });

  return total;
}
