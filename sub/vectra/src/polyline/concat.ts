import type { PolylineConcatOptions, PolylineLike, XYObjectWritable } from '../types';
import { concatInto } from './concat-into';

/**
 * 여러 polyline을 순서대로 이어 붙인 새 point 배열을 반환한다.
 *
 * 기본 dedupe는 `weldTolerance`가 `0`이면 인접 source polyline의 접합 endpoint를 exact equality로
 * 비교하고, 양수이면 endpoint 사이 `Math.hypot` 거리가 `weldTolerance` 이하일 때 현재 source의
 * 첫 point를 제거한다. 같은 source 내부 repeated point는 유지한다. 자세한 정책은 대응 `concatInto`를
 * 따른다.
 * empty source collection은 빈 배열, empty source polyline은 무시, single-point source는 직전
 * output endpoint와 dedupe될 수 있다.
 * finite 검증은 하지 않는다. `NaN` / `Infinity` 좌표는 그대로 전파하며, 거리가 `NaN`이면 dedupe하지 않는다.
 * buffer 재사용이 필요하면 `concatInto`를 사용한다.
 *
 * @param polylines 순서대로 이어 붙일 polyline 목록
 * @param options `weldTolerance`(finite `>= 0`, 기본 `0`) 접합 endpoint dedupe 옵션
 * @throws {RangeError} `weldTolerance`가 finite `>= 0`이 아니면(음수, `NaN`, `±Infinity`) 던진다.
 */
export function concat(polylines: readonly PolylineLike[], options?: PolylineConcatOptions): XYObjectWritable[] {
  return concatInto([], polylines, options);
}
