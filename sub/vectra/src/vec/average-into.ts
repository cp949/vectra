import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';

/**
 * inputs 배열에 있는 모든 벡터의 성분별 평균을 out에 기록하고 true를 반환한다.
 *
 * inputs가 빈 배열이면 out을 수정하지 않고 false를 반환한다.
 * NaN, Infinity, -Infinity 입력은 그대로 합산에 반영된다(pass-through).
 * 합산 결과가 Infinity/-Infinity인 경우에도 그대로 기록된다.
 *
 * @param out 결과를 기록할 writable output
 * @param inputs 평균을 구할 입력 벡터 배열
 */
export function averageInto(out: XYWritable, inputs: readonly XYInput[]): boolean {
  const count = inputs.length;

  if (count === 0) {
    return false;
  }

  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < count; i++) {
    sumX += readX(inputs[i]);
    sumY += readY(inputs[i]);
  }

  writeXY(out, sumX / count, sumY / count);
  return true;
}
