import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, RectLike, XYObjectWritable } from '../types';

/**
 * infinite-line과 rect boundary의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다.
 * - 양방향 transversal crossing 2점, corner touch 1점(dedupe), edge collinear overlap은 start/end
 *   2점이다.
 * - empty rect(width ≤ 0 또는 height ≤ 0), zero direction(degenerate)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 line parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param line 교점을 구할 infinite-line (전체 finite t 범위)
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function infiniteLineRectIntersectionsInto(
  outPoints: XYObjectWritable[],
  line: InfiniteLineLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  outPoints.length = 0;
  if (rw <= 0 || rh <= 0) return outPoints;
  const origin = readInfiniteLineOrigin(line);
  const direction = readInfiniteLineDirection(line);
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersectionPoints(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'inf',
    rx,
    ry,
    rx + rw,
    ry + rh,
    epsilon
  );
}
