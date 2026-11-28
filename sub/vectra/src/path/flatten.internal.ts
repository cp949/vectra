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
  options?: PathFlattenOptions
): PointWritable[] {
  out.length = 0;

  if (commands.length === 0) {
    return out;
  }

  const flattener = createSegmentFlattener(options);

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
