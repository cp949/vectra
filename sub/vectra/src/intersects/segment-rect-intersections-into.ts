import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { RectLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 rect boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다.
 * - transversal crossing 2점, corner touch 1점(dedupe), edge collinear overlap은 start/end 2점이다.
 * - segment 전체가 rect 내부(boundary 교점 없음)이면 빈 배열이다.
 * - empty rect(width ≤ 0 또는 height ≤ 0), zero-length segment는 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 segment parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param segment 교점을 구할 segment
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function segmentRectIntersectionsInto(
  outPoints: XYObjectWritable[],
  segment: SegmentLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  outPoints.length = 0;
  if (rw <= 0 || rh <= 0) return outPoints;
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = readX(a);
  const ay = readY(a);
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersectionPoints(
    outPoints,
    ax,
    ay,
    readX(b) - ax,
    readY(b) - ay,
    'finite',
    rx,
    ry,
    rx + rw,
    ry + rh,
    epsilon
  );
}
