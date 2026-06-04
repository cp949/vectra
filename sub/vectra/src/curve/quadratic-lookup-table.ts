import type { CurveLookupEntry, XYInput } from '../types';
import { quadraticLookupTableInto } from './quadratic-lookup-table-into';

/**
 * quadratic Bezier curve의 uniform t cumulative chord-length lookup table을 새 배열로 반환한다.
 *
 * sample 위치: t = i / (steps - 1), i = 0..steps-1 (endpoint 포함).
 * entry는 { t, length } fixed object이며, length는 인접 sample 사이 Euclidean chord distance의 누적값이다.
 * exact arc length가 아니라 빠른 approximate lookup용 chord-length table이다.
 * 첫 entry는 { t: 0, length: 0 }, 마지막 entry는 { t: 1, length: approximateTotalLength }.
 * length는 nondecreasing이다. zero-length curve는 모든 length가 0이다.
 * 좌표는 검증 없이 사용하므로 NaN/Infinity는 length로 pass-through된다.
 * steps validation 실패 시 RangeError를 던진다.
 * 성능 최적화가 필요하면 `quadraticLookupTableInto`를 사용한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param steps table entry 수. 2 이상 0xffffffff 이하의 safe integer. 범위 밖이면 RangeError.
 * @returns 새로 만든 CurveLookupEntry 배열
 */
export function quadraticLookupTable(p0: XYInput, p1: XYInput, p2: XYInput, steps: number): CurveLookupEntry[] {
  return quadraticLookupTableInto([], p0, p1, p2, steps);
}
