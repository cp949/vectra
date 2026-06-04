import { assertFiniteT } from './easing.internal';

/**
 * t가 0에 가까울 때 부드럽게 n으로 수렴하는 almostIdentity scalar shaping 함수다.
 *
 * t > m이면 t를 그대로 반환한다.
 * t <= m이면 cubic blend를 적용한다.
 * 수식 (t <= m): a = 2*n - m, b = 2*m - 3*n, ((a*t + b)*t*t) / (m*m) + n
 * t === 0이면 n을 반환한다.
 * t는 finite number여야 한다.
 * m은 finite positive number(> 0)여야 한다. 위반 시 RangeError.
 * n은 finite number여야 한다. 위반 시 RangeError.
 *
 * @param t easing progress (보통 [0, 1])
 * @param m 전환 임계값. finite positive (> 0). t > m이면 identity.
 * @param n t=0에서의 출력값. finite number.
 */
export function almostIdentity(t: number, m: number, n: number): number {
  assertFiniteT(t);
  if (!Number.isFinite(m) || m <= 0) {
    throw new RangeError('easing almostIdentity m must be a finite positive number (> 0)');
  }
  if (!Number.isFinite(n)) {
    throw new RangeError('easing almostIdentity n must be a finite number');
  }
  if (t > m) {
    return t;
  }
  const a = 2 * n - m;
  const b = 2 * m - 3 * n;
  return ((a * t + b) * t * t) / (m * m) + n;
}
