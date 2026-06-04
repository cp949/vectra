import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, TriangleLike, XYObjectWritable } from '../types';
import { triangleLineFamilyIntersectionsInto } from './triangle-line-family-intersections.internal';

/**
 * triangle과 infinite-line boundary의 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle 3개 edge(A-B, B-C, C-A)와의 교점을 모으고 vertex/edge 중복을 dedupe한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - line이 triangle을 가로지르면 양방향 2점이며 direction 부호와 무관하게 line parameter `t` 오름차순이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, zero-vector direction, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 line parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은 line parameter의 정확 비교를 따른다.
 * finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 line parameter다.
 * @param infiniteLine origin을 지나 direction 양방향으로 무한히 뻗는 직선
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleInfiniteLineIntersectionsInto(
  outPoints: XYObjectWritable[],
  triangle: TriangleLike,
  infiniteLine: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const origin = readInfiniteLineOrigin(infiniteLine);
  const direction = readInfiniteLineDirection(infiniteLine);
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return triangleLineFamilyIntersectionsInto(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'inf',
    ax,
    ay,
    bx,
    by,
    cx,
    cy,
    epsilon
  );
}
