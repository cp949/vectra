import type { XYObjectWritable } from '../types';
import { fromPolarInto } from './from-polar-into';

/**
 * 극좌표 (r, theta)를 XY 벡터로 변환해 새 object로 반환한다.
 *
 * x = r * cos(theta), y = r * sin(theta).
 *
 * @param r 반지름 (벡터의 길이)
 * @param theta 각도 (라디안, x축으로부터 반시계 방향)
 */
export function fromPolar(r: number, theta: number): XYObjectWritable {
  return fromPolarInto({ x: 0, y: 0 }, r, theta);
}
