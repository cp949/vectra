import { validateCapsuleRadius } from '../internal/capsule';
import type { Capsule, Segment } from '../types/flat-shapes.internal';
import { segmentSegmentDistanceSqXY } from './capsule-relation.internal';

/**
 * capsule과 segment가 교차하거나 접하면 true를 반환한다.
 *
 * `intersects` owner가 제공하는 capsule × segment relation이다. capsule axis segment와 input
 * segment 사이 최단 거리 제곱이 `radius²` 이하이면 true다. closed boundary 포함이라
 * `최단거리 === radius`이면 true다. `r === 0`이면 axis segment와 input segment가 교차하거나
 * 접할 때만 true다. input segment가 zero-length이면 점으로 환원해 capsule point relation과
 * 동등하게 판정한다. zero-axis capsule(`x1 === x2 && y1 === y2`)은 중심 (x1, y1), radius `r`의 circle-vs-segment
 * closed disk 판정과 동등하다. `r < 0`와 non-finite radius는 `RangeError`다. endpoint 좌표
 * non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule segment와의 교차를 판정할 capsule
 * @param segment capsule과 교차하는지 판정할 segment
 */
export function intersectsCapsuleSegment(capsule: Capsule, segment: Segment): boolean {
  const r = validateCapsuleRadius(capsule.r);
  const ax = capsule.x1;
  const ay = capsule.y1;
  const bx = capsule.x2;
  const by = capsule.y2;
  const cx = segment.x1;
  const cy = segment.y1;
  const dx = segment.x2;
  const dy = segment.y2;
  // squared 비교로 sqrt 호출을 피한다. closed boundary 포함
  return segmentSegmentDistanceSqXY(ax, ay, bx, by, cx, cy, dx, dy) <= r * r;
}
