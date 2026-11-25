import { lineFamilyCircleIntersects } from '../internal/line-family';
import {
  fillSegmentParam,
  lineHitCircleCenter,
  lineHitCircleRadius,
  lineHitParamA,
  lineHitSegmentA,
  lineHitSegmentB,
  lineHitX,
  lineHitY,
} from '../internal/line-hit-read.internal';
import { DEFAULT_EPSILON } from '../internal/numeric';
import type { CircleLike, SegmentLike } from '../types';

/**
 * circle과 segment가 교차하거나 접하면 true를 반환한다.
 *
 * closed disk 판정. tangent, 2-point crossing, segment 끝점이 disk 내부인 경우 모두 true.
 * radius ≤ 0인 circle: false.
 *
 * @param circle 교차를 판정할 circle
 * @param line 교차를 판정할 segment
 * @param epsilon 부동소수점 비교에 사용할 tolerance
 */
export function intersectsCircleSegment(circle: CircleLike, line: SegmentLike, epsilon = DEFAULT_EPSILON): boolean {
  const a = lineHitSegmentA(line);
  const b = lineHitSegmentB(line);
  const lineParam = fillSegmentParam(lineHitParamA, lineHitX(a), lineHitY(a), lineHitX(b), lineHitY(b));
  const center = lineHitCircleCenter(circle);
  return lineFamilyCircleIntersects(
    lineParam,
    lineHitX(center),
    lineHitY(center),
    lineHitCircleRadius(circle),
    epsilon
  );
}
