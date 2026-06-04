import type { XYInput, XYObjectWritable } from '../types';
import { directionToInto } from './direction-to-into';

/**
 * from에서 to 방향 단위 벡터를 새 object로 반환한다.
 *
 * from === to (같은 점) 또는 zero-length 차이 벡터에서는 throw하지 않고 { x: 0, y: 0 }을 반환한다.
 *
 * NaN / Infinity 입력은 JavaScript 산술 결과를 그대로 반환한다.
 *
 * @param from 방향 벡터 시작점
 * @param to 방향 벡터 끝점
 */
export function directionTo(from: XYInput, to: XYInput): XYObjectWritable {
  return directionToInto({ x: 0, y: 0 }, from, to);
}
