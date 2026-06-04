import type { PathCommand, PathFlattenOptions, XYObjectWritable } from '../types/index';
import { createCenterArcBuf, flattenDrawSegmentInto, forEachDrawSegment } from './path-segments.internal';

/**
 * commands를 out point 배열에 polyline으로 기록하고 out을 반환한다.
 * public `flattenInto`와 path relation helper가 같은 flatten 정책을 공유한다.
 */
export function flattenPathInto<Out extends XYObjectWritable[]>(
  out: Out,
  commands: readonly PathCommand[],
  options?: PathFlattenOptions
): Out {
  out.length = 0;

  if (commands.length === 0) {
    return out;
  }

  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const flatOpts = { flatness, maxRecursion };
  const curveBuffer: XYObjectWritable[] = [];
  const centerArcBuf = createCenterArcBuf();

  const pushPoint = (x: number, y: number): void => {
    out.push({ x, y } as Out[number]);
  };

  const lastPointEquals = (x: number, y: number): boolean => {
    const last = out[out.length - 1];
    return last !== undefined && last.x === x && last.y === y;
  };

  forEachDrawSegment(commands, (seg) => {
    if (out.length === 0 || (seg.kind !== 'close' && seg.startsSubpath && !lastPointEquals(seg.fromX, seg.fromY))) {
      pushPoint(seg.fromX, seg.fromY);
    }

    flattenDrawSegmentInto(curveBuffer, seg, flatOpts, centerArcBuf);

    for (let i = 1; i < curveBuffer.length; i++) {
      pushPoint(curveBuffer[i].x, curveBuffer[i].y);
    }
  });

  return out;
}
