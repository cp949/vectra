import type { Polygon } from '../types/flat-shapes.internal';
import type { PathCommand } from '../types/index';

/**
 * polygon을 move(첫 점) + line(나머지 점) + close, 총 N+1 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * 점 0개 → out clear만 하고 반환 (close 없음). 점 1개 이상이면 close를 항상 추가한다.
 * 점 < 3여도 throw 없이 구성 가능한 만큼만 기록한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param polygon 기록할 다각형 좌표 배열 (`[x0, y0, x1, y1, …]`, 길이는 짝수)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function polygonCommandsInto(out: PathCommand[], polygon: Polygon): PathCommand[] {
  out.length = 0;

  if (polygon.length === 0) {
    return out;
  }

  out.push({ kind: 'move', x: polygon[0], y: polygon[1] });
  for (let i = 2; i < polygon.length; i += 2) {
    out.push({ kind: 'line', x: polygon[i], y: polygon[i + 1] });
  }
  out.push({ kind: 'close' });
  return out;
}
