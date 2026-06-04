import type { MatrixWritable } from '../types';
import { reflectionInto } from './reflection-into';

/**
 * 원점을 통과하는 축에 대한 반사 행렬을 새 object로 반환한다.
 *
 * axisAngle은 반사 축의 방향각 (radian)이다.
 * 반사 축은 항상 원점을 통과하는 직선을 가정한다.
 * axisAngle이 NaN/Infinity이면 결과가 정의되지 않는다 (caller 책임).
 *
 * @param axisAngle 반사 축 방향각 (radian). 원점을 통과하는 직선의 방향.
 */
export function reflection(axisAngle: number): MatrixWritable {
  return reflectionInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, axisAngle);
}
