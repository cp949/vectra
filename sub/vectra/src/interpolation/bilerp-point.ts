import type { XYInput } from '../types';
import { bilerpPointInto } from './bilerp-point-into';

/**
 * 4개의 코너 좌표로 이루어진 grid에서 bilinear interpolation 결과를 새 object로 반환한다.
 *
 * `tx`, `ty`를 clamp하지 않으며 extrapolation을 허용한다.
 * 모든 input의 x/y와 tx/ty는 finite number여야 한다.
 *
 * @param p00 corner (tx=0, ty=0)
 * @param p10 corner (tx=1, ty=0) — x 방향으로 이동
 * @param p01 corner (tx=0, ty=1) — y 방향으로 이동
 * @param p11 corner (tx=1, ty=1)
 * @param tx x 방향 보간 비율. clamp 없음, extrapolation 허용
 * @param ty y 방향 보간 비율. clamp 없음, extrapolation 허용
 */
export function bilerpPoint(
  p00: XYInput,
  p10: XYInput,
  p01: XYInput,
  p11: XYInput,
  tx: number,
  ty: number
): { x: number; y: number } {
  return bilerpPointInto({ x: 0, y: 0 }, p00, p10, p01, p11, tx, ty);
}
