import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, XYWritable } from '../types';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * segment 위의 무작위 점을 균등 분포로 기록하고 out을 반환한다.
 *
 * degenerate segment(a === b)인 경우 endpoint를 기록한다.
 *
 * @param out - 결과를 기록할 writable 좌표 output
 * @param segment - 대상 segment. 두 endpoint를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnSegmentInto = <Out extends XYWritable>(out: Out, segment: SegmentLike, rng?: RandomSource): Out => {
  const t = random(rng);
  // a + t*(b-a) 공식으로 segment 위 점 계산
  const ax = readX(readSegmentA(segment));
  const ay = readY(readSegmentA(segment));
  const bx = readX(readSegmentB(segment));
  const by = readY(readSegmentB(segment));
  return writeXY(out, ax + t * (bx - ax), ay + t * (by - ay));
};
