import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readTriangleRawCoords } from '../internal/triangle';
import { readX, readY } from '../internal/xy';
import type { SegmentLike, TriangleLike, XYObjectWritable } from '../types';
import { triangleLineFamilyIntersectionsInto } from './triangle-line-family-intersections.internal';

/**
 * triangle과 segment boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * triangle 3개 edge(A-B, B-C, C-A)와의 교점을 모으고 vertex/edge 중복을 dedupe한다.
 * - transversal crossing, vertex touch 1점(dedupe), edge collinear overlap은 clipped start/end 2점이다.
 * - segment가 triangle 내부에 완전히 포함되어 boundary 교점이 없으면 빈 배열이다.
 * - degenerate triangle(signed area 2× === 0), non-finite vertex, zero-length segment, non-finite
 *   coordinate는 빈 배열이다. degenerate triangle을 segment/point relation으로 환원하지 않는다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 segment parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 range 판정은 segment parameter의 정확 비교를 따른다.
 * finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param triangle 교점을 구할 triangle. point ordering의 기준은 segment parameter다.
 * @param segment 교점을 구할 segment
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function triangleSegmentIntersectionsInto(
  outPoints: XYObjectWritable[],
  triangle: TriangleLike,
  segment: SegmentLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const a = readSegmentA(segment);
  const b = readSegmentB(segment);
  const ox = readX(a);
  const oy = readY(a);
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
  return triangleLineFamilyIntersectionsInto(
    outPoints,
    ox,
    oy,
    readX(b) - ox,
    readY(b) - oy,
    'finite',
    ax,
    ay,
    bx,
    by,
    cx,
    cy,
    epsilon
  );
}
