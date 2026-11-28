import type { Bounds, PointWritable } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * bounds 내부의 무작위 점을 균등 분포로 기록한다.
 *
 * `maxX < minX` 또는 `maxY < minY`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param bounds - 대상 bounds. min/max corner를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInBoundsInto = (out: PointWritable, bounds: Bounds, rng?: RandomSource): boolean => {
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // inverted bounds 검사: max가 min보다 작으면 실패
  if (maxX < minX || maxY < minY) {
    return false;
  }
  // min + random*(max-min) 공식으로 bounds 내부 점 계산
  const sampleX = minX + random(rng) * (maxX - minX);
  const sampleY = minY + random(rng) * (maxY - minY);
  out.x = sampleX;
  out.y = sampleY;
  return true;
};
