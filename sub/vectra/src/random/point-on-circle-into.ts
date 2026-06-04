import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * circle 둘레(circumference) 위의 무작위 점을 균등 분포로 기록한다.
 *
 * `radius <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param circle - 대상 circle. center와 radius를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnCircleInto = <Out extends XYWritable>(
  out: Out,
  circle: CircleLike,
  rng?: RandomSource
): boolean => {
  // degenerate circle 검사
  if (readCircleRadius(circle) <= 0) {
    return false;
  }
  // [0, 2π) 범위의 무작위 각도로 둘레 위 좌표 계산
  const theta = random(rng) * 2 * Math.PI;
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  writeXY(out, cx + readCircleRadius(circle) * Math.cos(theta), cy + readCircleRadius(circle) * Math.sin(theta));
  return true;
};
