import { readCircleCenter, readCircleRadius } from '../internal/circle';
import { readX, readY, writeXY } from '../internal/xy';
import type { CircleLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * circle 내부의 무작위 점을 면적 균등 분포(area-uniform)로 기록한다.
 *
 * `radius <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * area-uniform 보장을 위해 반지름에 sqrt를 적용한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param circle - 대상 circle. center와 radius를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInCircleInto = <Out extends XYWritable>(
  out: Out,
  circle: CircleLike,
  rng?: RandomSource
): boolean => {
  // degenerate circle 검사
  if (readCircleRadius(circle) <= 0) {
    return false;
  }
  // theta: [0, 2π) 균등 분포 각도
  const theta = random(rng) * 2 * Math.PI;
  // r: sqrt(random)*radius → area-uniform 분포
  const r = Math.sqrt(random(rng)) * readCircleRadius(circle);
  const cx = readX(readCircleCenter(circle));
  const cy = readY(readCircleCenter(circle));
  writeXY(out, cx + r * Math.cos(theta), cy + r * Math.sin(theta));
  return true;
};
