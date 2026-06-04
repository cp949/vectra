import type { XYInput, XYObjectWritable } from '../types';
import { normalLeftInto } from './normal-left-into';

/**
 * input 벡터의 CCW 수직 방향 (-y, x)을 normalize한 단위 벡터를 새 object로 반환한다.
 *
 * zero vector 입력에서는 throw하지 않고 { x: 0, y: 0 }을 반환한다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 반환한다.
 *
 * @param input CCW normal을 구할 입력 벡터
 */
export function normalLeft(input: XYInput): XYObjectWritable {
  return normalLeftInto({ x: 0, y: 0 }, input);
}
