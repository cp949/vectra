import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 두 벡터 a, b가 직교하는지 확인한다 (dot product = 0).
 *
 * 영벡터(길이가 0인 벡터)는 방향이 정의되지 않으므로 false를 반환한다.
 * dot product의 절댓값이 epsilon 이하이면 직교로 판단한다.
 *
 * @param a 첫 번째 벡터
 * @param b 두 번째 벡터
 * @param epsilon dot product 절대값 기준 허용 오차. 입력 벡터 크기에 비례하므로 단위 벡터에 적합하다. 기본값: 0
 */
export function isOrthogonal(a: XYInput, b: XYInput, epsilon = 0): boolean {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);

  // 영벡터는 방향이 없으므로 직교 관계가 성립하지 않는다
  const aLenSq = ax * ax + ay * ay;
  const bLenSq = bx * bx + by * by;
  if (aLenSq === 0 || bLenSq === 0) return false;

  const dot = ax * bx + ay * by;
  return Math.abs(dot) <= epsilon;
}
