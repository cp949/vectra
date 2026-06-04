import type { PathCommand, PolylineLike } from '../types/index';
import { readPolylinePoints } from './polyline';
import { readX, readY } from './xy';

/**
 * polyline을 move(첫 점) + line(나머지 점) command sequence로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * 점 0개 → out clear만 하고 반환. 점 1개 → move만 기록.
 * finite 검증은 하지 않는다. invalid numeric(NaN, Inf)은 그대로 전파한다.
 *
 * public `path.polylineCommandsInto`와 `polyline.toPathInto`가 같은 writer를 공유한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param polyline 기록할 polyline (`readonly XYInput[]` 또는 `{ points }` object)
 */
export function writePolylineCommandsInto<Out extends PathCommand[]>(out: Out, polyline: PolylineLike): Out {
  const points = readPolylinePoints(polyline);

  // out과 polyline은 서로 다른 element type이라 구조상 aliasing이 불가능하다. clear 후 바로 채운다.
  out.length = 0;

  if (points.length === 0) {
    return out;
  }

  out.push({ kind: 'move', x: readX(points[0]), y: readY(points[0]) } as Out[number]);
  for (let i = 1; i < points.length; i++) {
    out.push({ kind: 'line', x: readX(points[i]), y: readY(points[i]) } as Out[number]);
  }
  return out;
}
