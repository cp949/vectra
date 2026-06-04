import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyIntersects } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike } from '../types';

/**
 * 두 infinite-line이 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * 동일 직선 (collinear): true.
 * direction이 zero-vector인 degenerate infinite-line은 점으로 환원해 다른 쪽 직선의 containment로 판정한다.
 *
 * @param a 첫 번째 infinite-line
 * @param b 두 번째 infinite-line
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsInfiniteLineInfiniteLine(
  a: InfiniteLineLike,
  b: InfiniteLineLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const ao = readInfiniteLineOrigin(a);
  const ad = readInfiniteLineDirection(a);
  const bo = readInfiniteLineOrigin(b);
  const bd = readInfiniteLineDirection(b);
  return lineFamilyIntersects(
    infiniteLineToLineFamilyParam(readX(ao), readY(ao), readX(ad), readY(ad)),
    infiniteLineToLineFamilyParam(readX(bo), readY(bo), readX(bd), readY(bd)),
    epsilon
  );
}
