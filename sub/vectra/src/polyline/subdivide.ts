import type { PolylineLike, PolylineSubdivideOptions, XYObjectWritable } from '../types';
import { subdivideInto } from './subdivide-into';

/**
 * polyline의 각 segment를 같은 개수로 분할한 새 point 배열을 반환한다.
 *
 * arc-length 균등 resampling이 아니다. segment별 parameter 등분으로만 분할한다. 자세한 정책은
 * 대응 `subdivideInto`를 따른다.
 * empty / single-point polyline은 point 복제로 반환하고, zero-length segment도 같은 보간으로
 * 중복 point를 그대로 전파한다.
 * finite 검증은 하지 않는다. source point 좌표는 그대로 전파한다. 내부 분할점은 segment 보간을
 * 거치므로 Infinity 좌표 조합에 따라 NaN/Infinity가 생성될 수 있다.
 * buffer 재사용이 필요하면 `subdivideInto`를 사용한다.
 *
 * @param polyline 분할할 polyline
 * @param options `segmentsPerSegment`(positive integer, 기본 `2`) 분할 옵션
 * @throws {RangeError} `segmentsPerSegment`가 positive integer가 아니면 던진다.
 */
export function subdivide(polyline: PolylineLike, options?: PolylineSubdivideOptions): XYObjectWritable[] {
  return subdivideInto([], polyline, options);
}
