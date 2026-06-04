import type { PolylineLike, XYObjectWritable } from '../types';
import { closeInto } from './close-into';

/**
 * polyline을 닫힌 point list로 만든 새 point 배열을 반환한다.
 *
 * polygon topology 변환이 아니다. 첫 점 좌표를 마지막에 복제할 뿐 area/ring validation은 하지 않는다.
 * empty polyline은 빈 배열, single-point polyline은 같은 좌표 2개, 이미 닫힌 polyline은 source
 * point 수만큼만 반환한다. 자세한 정책은 대응 `closeInto`를 따른다.
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파한다.
 * buffer 재사용이 필요하면 `closeInto`를 사용한다.
 *
 * @param polyline point를 읽을 polyline
 */
export function close(polyline: PolylineLike): XYObjectWritable[] {
  return closeInto([], polyline);
}
