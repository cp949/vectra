import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * 삼각형 내부의 무작위 점을 균등 분포(barycentric 방법)로 기록하고 out을 반환한다.
 *
 * r + s > 1인 경우 삼각형 반대편 영역에 해당하므로 (1-r, 1-s)로 반사 처리한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param a - 삼각형 첫 번째 꼭짓점
 * @param b - 삼각형 두 번째 꼭짓점
 * @param c - 삼각형 세 번째 꼭짓점
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInTriangleInto = <Out extends XYWritable>(
  out: Out,
  a: XYInput,
  b: XYInput,
  c: XYInput,
  rng?: RandomSource
): Out => {
  let r = random(rng);
  let s = random(rng);

  // r + s > 1이면 삼각형 외부 → 반사 변환으로 내부로 이동
  if (r + s > 1) {
    r = 1 - r;
    s = 1 - s;
  }

  const ax = readX(a);
  const ay = readY(a);
  // a + (b-a)*r + (c-a)*s 공식으로 삼각형 내부 점 계산
  const x = ax + (readX(b) - ax) * r + (readX(c) - ax) * s;
  const y = ay + (readY(b) - ay) * r + (readY(c) - ay) * s;
  return writeXY(out, x, y);
};
