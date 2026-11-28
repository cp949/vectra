import type { PointWritable, Rect } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * rect 내부의 무작위 점을 균등 분포로 기록한다.
 *
 * `width <= 0` 또는 `height <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param rect - 대상 rect
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInRectInto = (out: PointWritable, rect: Rect, rng?: RandomSource): boolean => {
  const x = rect.x;
  const y = rect.y;
  const width = rect.width;
  const height = rect.height;
  // degenerate rect 검사: width 또는 height가 양수가 아니면 실패
  if (width <= 0 || height <= 0) {
    return false;
  }
  const sampleX = x + random(rng) * width;
  const sampleY = y + random(rng) * height;
  out.x = sampleX;
  out.y = sampleY;
  return true;
};
