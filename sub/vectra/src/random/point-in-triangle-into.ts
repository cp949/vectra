import type { PointWritable, Triangle } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * 삼각형 내부의 무작위 점을 균등 분포(barycentric 방법)로 기록하고 out을 반환한다.
 *
 * r + s > 1인 경우 삼각형 반대편 영역에 해당하므로 (1-r, 1-s)로 반사 처리한다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param triangle - 대상 삼각형
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInTriangleInto = <Out extends PointWritable>(
  out: Out,
  triangle: Triangle,
  rng?: RandomSource
): Out => {
  let r = random(rng);
  let s = random(rng);

  // r + s > 1이면 삼각형 외부 → 반사 변환으로 내부로 이동
  if (r + s > 1) {
    r = 1 - r;
    s = 1 - s;
  }

  const ax = triangle.x1;
  const ay = triangle.y1;
  // a + (b-a)*r + (c-a)*s 공식으로 삼각형 내부 점 계산
  const x = ax + (triangle.x2 - ax) * r + (triangle.x3 - ax) * s;
  const y = ay + (triangle.y2 - ay) * r + (triangle.y3 - ay) * s;
  out.x = x;
  out.y = y;
  return out;
};
