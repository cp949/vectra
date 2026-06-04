import { lineFamilyBoxIntersectionPoints } from '../internal/line-family-box';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readRayDirection, readRayOrigin } from '../internal/ray';
import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import { readX, readY } from '../internal/xy';
import type { RayLike, RectLike, XYObjectWritable } from '../types';

/**
 * ray와 rect boundary의 range 안 모든 교점을 outPoints에 기록하고 같은 outPoints를 반환한다.
 *
 * rect boundary 4개 edge와의 교점을 모으고 corner/edge 중복을 dedupe한다.
 * - transversal crossing, corner touch 1점(dedupe), edge collinear overlap은 start/end 2점이다.
 * - ray origin이 rect 내부면 t ≥ 0 exit 교점만 반환한다. boundary 교점이 없으면 빈 배열이다.
 * - empty rect(width ≤ 0 또는 height ≤ 0), zero direction(degenerate)은 빈 배열을 남긴다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push된다. push되는 point는 매 호출 새 `{ x, y }` object이며
 * 입력 point object를 재사용하지 않는다. 반환 순서는 ray parameter `t` 오름차순이다.
 * `epsilon`은 collinear/dedupe 판정에만 쓰고 finite validation에는 쓰지 않는다.
 *
 * @param outPoints 교점 object를 기록할 writable output array (호출 전 내용은 비워진다)
 * @param ray origin에서 direction 방향으로 뻗는 반직선 (t ≥ 0 범위)
 * @param rect 교점을 구할 rect (axis-aligned)
 * @param epsilon collinear/dedupe 판정 임계값
 */
export function rayRectIntersectionsInto(
  outPoints: XYObjectWritable[],
  ray: RayLike,
  rect: RectLike,
  epsilon = DEFAULT_EPSILON
): XYObjectWritable[] {
  const rw = readRectWidth(rect);
  const rh = readRectHeight(rect);
  outPoints.length = 0;
  if (rw <= 0 || rh <= 0) return outPoints;
  const origin = readRayOrigin(ray);
  const direction = readRayDirection(ray);
  const rx = readRectX(rect);
  const ry = readRectY(rect);
  return lineFamilyBoxIntersectionPoints(
    outPoints,
    readX(origin),
    readY(origin),
    readX(direction),
    readY(direction),
    'ray',
    rx,
    ry,
    rx + rw,
    ry + rh,
    epsilon
  );
}
