import type { MatrixWritable } from '../types';
import { rotationMatrixInto } from './rotation-matrix-into';

/**
 * identity 기반 rotation-only matrix를 새 plain object로 반환한다.
 *
 * 기존 matrix를 합성하지 않고, angle로부터 rotation-only component matrix를 새로 생성한다. angle은 radian이다.
 * 회전 중심은 origin이다. `rotationMatrixInto`의 allocating companion이다.
 *
 * NaN/Infinity angle은 검증하지 않는다. `Math.cos`/`Math.sin` 산술 결과를 그대로 기록한다 (caller 책임).
 *
 * @param angle 생성할 rotation angle (radian)
 */
export function rotationMatrix(angle: number): MatrixWritable {
  return rotationMatrixInto({ a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 }, angle);
}
