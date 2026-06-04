import type { CircleLike, InfiniteLineLike, SegmentWritable } from '../types';
import { segmentInsideCircleInto } from './segment-inside-circle-into';

/**
 * infinite-line이 circle 내부를 지나는 새 chord segment를 반환한다. no-hit/tangent이면 undefined를 반환한다.
 *
 * 대응 `segmentInsideCircleInto`와 정책이 같다. infinite-line range와 disk 내부 구간의 교집합을
 * bounded segment로 반환한다. endpoint 순서는 source direction의 increasing `t`다.
 * 실패 조건: zero-direction(degenerate) infinite-line, circle radius가 finite positive 아님, disk와
 * 만나지 않음, tangent(chord 길이 0), non-finite 좌표.
 *
 * @param line chord를 구할 infinite-line
 * @param circle 경계 circle
 */
export function segmentInsideCircle(line: InfiniteLineLike, circle: CircleLike): SegmentWritable | undefined {
  const seed: SegmentWritable = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  if (!segmentInsideCircleInto(seed, line, circle)) return undefined;
  return seed;
}
