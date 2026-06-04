import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 두 벡터 a와 b 사이의 각도를 radian으로 반환한다. 범위는 [0, π].
 *
 * a 또는 b가 zero vector이면 0을 반환한다.
 * 부동소수점 오차로 계산된 cosine 값이 [-1, 1] 밖으로 밀리면 clamp한다.
 *
 * @param a 각도를 측정할 첫 번째 벡터
 * @param b 각도를 측정할 두 번째 벡터
 */
export function angleBetween(a: XYInput, b: XYInput): number {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);

  const lenA = Math.hypot(ax, ay);
  const lenB = Math.hypot(bx, by);

  // zero vector는 방향이 없으므로 각도 0으로 환원한다.
  if (lenA === 0 || lenB === 0) {
    return 0;
  }

  // dot(a, b) / (|a| * |b|) 를 -1~1 범위로 clamp하여 acos 적용
  const cosTheta = (ax * bx + ay * by) / (lenA * lenB);
  const clamped = cosTheta < -1 ? -1 : cosTheta > 1 ? 1 : cosTheta;

  return Math.acos(clamped);
}
