import type { Circle, PointWritable } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * circle 둘레(circumference) 위의 무작위 점을 균등 분포로 기록한다.
 *
 * `r <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param circle - 대상 circle. `cx, cy, r`을 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnCircleInto = (out: PointWritable, circle: Circle, rng?: RandomSource): boolean => {
  // degenerate circle 검사
  if (circle.r <= 0) {
    return false;
  }
  // [0, 2π) 범위의 무작위 각도로 둘레 위 좌표 계산
  const theta = random(rng) * 2 * Math.PI;
  const cx = circle.cx;
  const cy = circle.cy;
  const sampleX = cx + circle.r * Math.cos(theta);
  const sampleY = cy + circle.r * Math.sin(theta);
  out.x = sampleX;
  out.y = sampleY;
  return true;
};
