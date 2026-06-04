import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, SegmentLike, XYObjectWritable } from '../types';

/**
 * segment와 bounds boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * bounds boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다. rect helper와 계산은 같으나
 * empty 기준이 다르다: rect는 width/height ≤ 0을 empty로 보고, bounds는 inverted(max < min)만 empty로
 * 보아 zero-extent(점·선) bounds도 유효 입력으로 처리한다.
 * - transversal crossing 2점, corner touch 1점(dedupe), edge collinear overlap은 start/end 2점이다.
 * - segment 전체가 bounds 내부(boundary 교점 없음)이면 빈 배열이다.
 * - inverted bounds(max < min), zero-length segment는 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 segment parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param segment 교점을 구할 segment
 * @param bounds 교점을 구할 bounds (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function segmentBoundsIntersectionsInto(
  outPoints: XYObjectWritable[],
  segment: SegmentLike,
  bounds: BoundsLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const x0 = readX(min);
  const y0 = readY(min);
  const x1 = readX(max);
  const y1 = readY(max);
  outPoints.length = 0;
  if (x1 < x0 || y1 < y0) return outPoints;
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ax = readX(a);
  const ay = readY(a);
  return lineFamilyBoxIntersectionPoints(
    outPoints,
    ax,
    ay,
    readX(b) - ax,
    readY(b) - ay,
    'finite',
    x0,
    y0,
    x1,
    y1,
    epsilon
  );
}
