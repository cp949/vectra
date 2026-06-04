import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY, writeXY } from '../internal/xy';
import type { BoundsLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * bounds 내부의 무작위 점을 균등 분포로 기록한다.
 *
 * `max.x < min.x` 또는 `max.y < min.y`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param bounds - 대상 bounds. min/max corner를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInBoundsInto = <Out extends XYWritable>(
  out: Out,
  bounds: BoundsLike,
  rng?: RandomSource
): boolean => {
  const minX = readX(readBoundsMin(bounds));
  const minY = readY(readBoundsMin(bounds));
  const maxX = readX(readBoundsMax(bounds));
  const maxY = readY(readBoundsMax(bounds));

  // inverted bounds 검사: max가 min보다 작으면 실패
  if (maxX < minX || maxY < minY) {
    return false;
  }
  // min + random*(max-min) 공식으로 bounds 내부 점 계산
  writeXY(out, minX + random(rng) * (maxX - minX), minY + random(rng) * (maxY - minY));
  return true;
};
