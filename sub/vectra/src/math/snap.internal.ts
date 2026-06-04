/**
 * scalar snap kernel — validation 없음.
 *
 * validation이 필요한 public API(snap-grid.ts, snap-grid-into.ts, snap-angle.ts,
 * snap-distance.ts 등)에서 이 함수를 호출한다.
 */

/**
 * value를 start 기준 gap 단위로 snap한다.
 *
 * validation 없음. 호출 측에서 gap > 0, 모든 인자가 finite number임을 보장해야 한다.
 *
 * @param value snap grid에 맞출 값
 * @param gap snap 간격
 * @param start snap grid의 기준점
 */
export function snapScalar(value: number, gap: number, start: number): number {
  return start + Math.round((value - start) / gap) * gap;
}
