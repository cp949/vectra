import { assertFiniteT } from './easing.internal';

/**
 * GSAP/CSS steps() 스타일의 계단형 easing 함수다.
 *
 * count개의 계단, direction으로 riser 위치를 제어한다.
 * - "end": 구간 끝에서 계단이 올라간다 (floor 방식, t=0에서 0 반환).
 * - "start": 구간 시작에서 계단이 올라간다 (ceil 방식, t=0에서 0 반환).
 *   CSS jump-start는 t=0에서 1/n을 반환하므로 CSS 명세와 동일하지 않다.
 *
 * count는 양의 정수(>= 1)여야 한다. 위반 시 RangeError.
 * invalid direction 값은 RangeError.
 * t는 finite number여야 한다.
 *
 * @param t easing progress (보통 [0, 1])
 * @param count 계단 수. 양의 정수 >= 1
 * @param direction riser 위치. "start" | "end". 기본값 "end"
 */
export function steps(t: number, count: number, direction: 'start' | 'end' = 'end'): number {
  assertFiniteT(t);

  // count가 양의 정수인지 검증한다
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('easing steps count must be a positive integer (>= 1)');
  }

  // direction 유효성을 검증한다
  if (direction !== 'start' && direction !== 'end') {
    throw new RangeError('easing steps direction must be "start" or "end"');
  }

  if (direction === 'end') {
    // 구간 끝에서 계단이 올라간다
    return Math.floor(t * count) / count;
  }

  // 구간 시작에서 계단이 올라간다
  return Math.ceil(t * count) / count;
}
