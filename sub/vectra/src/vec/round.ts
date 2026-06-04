import type { XYInput, XYObjectWritable } from '../types';
import { roundInto } from './round-into';

/**
 * input의 각 성분을 반올림한 벡터를 새 object로 반환한다.
 *
 * NaN, Infinity, -Infinity 입력은 그대로 통과된다.
 * 반올림 방향은 Math.round 정책을 따른다 (0.5는 양의 무한대 방향으로 올림).
 *
 * @param input 반올림할 입력 벡터
 */
export function round(input: XYInput): XYObjectWritable {
  return roundInto({ x: 0, y: 0 }, input);
}
