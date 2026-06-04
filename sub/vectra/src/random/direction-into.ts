import { writeXY } from '../internal/xy';
import type { XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * 균등 분포 angle로 무작위 방향 벡터를 기록하고 out을 반환한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param length - 벡터 길이. 기본값 1
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const directionInto = <Out extends XYWritable>(out: Out, length = 1, rng?: RandomSource): Out => {
  // [0, 2π) 범위의 무작위 각도 계산
  const theta = random(rng) * 2 * Math.PI;
  return writeXY(out, Math.cos(theta) * length, Math.sin(theta) * length);
};
