import type { XYInput, XYObjectWritable } from '../types';
import { averageInto } from './average-into';

/**
 * inputs 배열에 있는 모든 벡터의 성분별 평균을 새 object로 반환한다.
 *
 * inputs가 빈 배열이면 undefined를 반환한다.
 * NaN, Infinity, -Infinity 입력은 그대로 합산에 반영된다(pass-through).
 * 합산 결과가 Infinity/-Infinity인 경우에도 그대로 기록된다.
 *
 * @param inputs 평균을 구할 입력 벡터 배열
 */
export function average(inputs: readonly XYInput[]): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return averageInto(out, inputs) ? out : undefined;
}
