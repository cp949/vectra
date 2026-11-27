import type { PathCommand } from '../types/index';
import type { Polyline } from '../types/flat-shapes.internal';

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
 * @param points 기록할 polyline (점 객체 배열)
 */
export function writePolylineCommandsInto(out: PathCommand[], points: Polyline): PathCommand[] {
  // out과 polyline은 서로 다른 element type이라 구조상 aliasing이 불가능하다. clear 후 바로 채운다.
  out.length = 0;

  if (points.length === 0) {
    return out;
  }

  out.push({ kind: 'move', x: points[0].x, y: points[0].y });
  for (let i = 1; i < points.length; i++) {
    out.push({ kind: 'line', x: points[i].x, y: points[i].y });
  }
  return out;
}
