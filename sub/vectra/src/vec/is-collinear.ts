import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * 세 점 a, b, c가 일직선인지 확인한다.
 *
 * cross product `(b - a) × (c - a)`의 절댓값이 epsilon 이하이면 collinear로 판단한다.
 * 세 점 중 하나라도 다른 점과 일치하거나 zero-vector이어서 (b-a) 또는 (c-a)가 영벡터가 되는
 * 경우에도 cross product가 0이 되어 true를 반환한다.
 *
 * @param a 첫 번째 점
 * @param b 두 번째 점
 * @param c 세 번째 점
 * @param epsilon cross product 절대값 기준 허용 오차. 입력 벡터 크기에 비례하므로 단위 벡터에 적합하다. 기본값: 0
 */
export function isCollinear(a: XYInput, b: XYInput, c: XYInput, epsilon = 0): boolean {
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const cx = readX(c);
  const cy = readY(c);

  const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  return Math.abs(cross) <= epsilon;
}
