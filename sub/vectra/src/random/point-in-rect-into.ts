import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { writeXY } from '../internal/xy';
import type { RectLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * rect 내부의 무작위 점을 균등 분포로 기록한다.
 *
 * `width <= 0` 또는 `height <= 0`이면 false를 반환하고 out을 수정하지 않는다.
 * 성공 시 true를 반환한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param rect - 대상 rect
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointInRectInto = <Out extends XYWritable>(out: Out, rect: RectLike, rng?: RandomSource): boolean => {
  const x = readRectX(rect);
  const y = readRectY(rect);
  const width = readRectWidth(rect);
  const height = readRectHeight(rect);
  // degenerate rect 검사: width 또는 height가 양수가 아니면 실패
  if (width <= 0 || height <= 0) {
    return false;
  }
  writeXY(out, x + random(rng) * width, y + random(rng) * height);
  return true;
};
