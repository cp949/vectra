import { readPolygonPoints } from '../internal/polygon';
import { readX, readY } from '../internal/xy';
import type { PathCommand, PolygonLike } from '../types/index';

/**
 * polygon을 move(첫 점) + line(나머지 점) + close, 총 N+1 command로 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 좌표는 모두 절대좌표다.
 * 점 0개 → out clear만 하고 반환 (close 없음). 점 1개 이상이면 close를 항상 추가한다.
 * 점 < 3여도 throw 없이 구성 가능한 만큼만 기록한다.
 *
 * @param out command를 기록할 mutable PathCommand 배열
 * @param polygon 기록할 polygon (`readonly XYInput[]` 또는 `{ points }` object)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function polygonCommandsInto<Out extends PathCommand[]>(out: Out, polygon: PolygonLike): Out {
  const points = readPolygonPoints(polygon);

  // clear 전에 길이를 읽어 두면 out과 무관하게 안전하다 (구조상 aliasing 불가).
  out.length = 0;

  if (points.length === 0) {
    return out;
  }

  out.push({ kind: 'move', x: readX(points[0]), y: readY(points[0]) } as Out[number]);
  for (let i = 1; i < points.length; i++) {
    out.push({ kind: 'line', x: readX(points[i]), y: readY(points[i]) } as Out[number]);
  }
  out.push({ kind: 'close' } as Out[number]);
  return out;
}
