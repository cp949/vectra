import type { PointWritable, Segment } from '../types/flat-shapes.internal';
import type { RandomSource } from './random';
import { random } from './random';

/**
 * segment 위의 무작위 점을 균등 분포로 기록하고 out을 반환한다.
 *
 * 시작점과 끝점이 같은 segment면 endpoint를 기록한다.
 *
 * @param out - 샘플 좌표를 기록할 출력 객체 (`x, y`)
 * @param segment - 대상 segment. 두 endpoint를 읽는다
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다
 */
export const pointOnSegmentInto = <Out extends PointWritable>(out: Out, segment: Segment, rng?: RandomSource): Out => {
  const t = random(rng);
  // a + t*(b-a) 공식으로 segment 위 점 계산
  const ax = segment.x1;
  const ay = segment.y1;
  const bx = segment.x2;
  const by = segment.y2;
  const sampleX = ax + t * (bx - ax);
  const sampleY = ay + t * (by - ay);
  out.x = sampleX;
  out.y = sampleY;
  return out;
};
