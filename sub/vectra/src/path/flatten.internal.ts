import type { PointWritable } from '../types/flat-shapes.internal';
import type { PathCommand, PathFlattenOptions } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';
import { createSegmentFlattener } from './segment-flattener.internal';

/**
 * commands를 out point 배열에 polyline으로 기록하고 out을 반환한다.
 * public `flattenInto`와 path relation helper가 같은 flatten 정책을 공유한다.
 */
export function flattenPathInto(
  out: PointWritable[],
  commands: readonly PathCommand[],
  options?: Partial<PathFlattenOptions>
): PointWritable[] {
  out.length = 0;

  if (commands.length === 0) {
    return out;
  }

  // v2-migration: polyline과 intersects 전환 후 평평한 옵션을 그대로 넘긴다.
  const flattener = createSegmentFlattener(
    options === undefined ? undefined : { flatness: options.flatness ?? 0.5, maxRecursion: options.maxRecursion ?? 32 }
  );

  const pushPoint = (x: number, y: number): void => {
    out.push({ x, y });
  };

  const lastPointEquals = (x: number, y: number): boolean => {
    const last = out[out.length - 1];
    return last !== undefined && last.x === x && last.y === y;
  };

  forEachDrawSegment(commands, (seg) => {
    if (out.length === 0 || (seg.kind !== 'close' && seg.startsSubpath && !lastPointEquals(seg.fromX, seg.fromY))) {
      pushPoint(seg.fromX, seg.fromY);
    }

    const curveBuffer = flattener.flatten(seg);

    for (let i = 1; i < curveBuffer.length; i++) {
      pushPoint(curveBuffer[i].x, curveBuffer[i].y);
    }
  });

  return out;
}
