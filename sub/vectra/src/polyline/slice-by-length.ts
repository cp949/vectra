import type { PolylineLike, XYObjectWritable } from '../types';
import { sliceByLengthInto } from './slice-by-length-into';

/**
 * sliceByLengthInto의 allocating companion. 새 배열에 새 plain point object를 담아 반환한다.
 *
 * clamp, reversed range, interpolated endpoint / 내부 vertex 포함, empty/single/repeated total
 * length 0 fallback 정책은 `sliceByLengthInto`와 동일하다. empty polyline은 빈 배열을 반환한다.
 *
 * finite 검증은 하지 않는다. `NaN` / `Infinity` 좌표는 JS 산술로 그대로 전파한다. `startLength` /
 * `endLength`가 `NaN`이면 clamp 결과가 `NaN`이므로 endpoint interpolation이 `NaN` component를 전파하고,
 * total length가 `NaN`이면 endpoint와 내부 비교가 JS 규칙대로 `NaN`을 전파한다. 별도 `RangeError`를
 * 던지지 않는다.
 *
 * @param polyline 구간을 추출할 polyline
 * @param startLength 구간 시작 arc-length offset
 * @param endLength 구간 끝 arc-length offset
 */
export function sliceByLength(polyline: PolylineLike, startLength: number, endLength: number): XYObjectWritable[] {
  return sliceByLengthInto([], polyline, startLength, endLength);
}
