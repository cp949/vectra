import type { PointWritable } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * 균등 분포 angle로 무작위 방향 벡터를 기록하고 out을 반환한다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param length - 벡터 길이. 기본값 1
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const directionInto = <Out extends PointWritable>(out: Out, length = 1, rng?: RandomSource): Out => {
  // [0, 2π) 범위의 무작위 각도 계산
  const theta = random(rng) * 2 * Math.PI;
  const sampleX = Math.cos(theta) * length;
  const sampleY = Math.sin(theta) * length;
  out.x = sampleX;
  out.y = sampleY;
  return out;
};
