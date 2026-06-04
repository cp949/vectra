import { readInfiniteLineDirection, readInfiniteLineOrigin } from '../internal/infinite-line';
import { infiniteLineToLineFamilyParam, lineFamilyIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { DEFAULT_EPSILON } from '../internal/numeric';
import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY } from '../internal/xy';
import type { InfiniteLineLike, SegmentLike } from '../types';

/**
 * infinite-line과 segment가 교차하면 true를 반환한다.
 *
 * 평행 (방향 벡터가 평행, 서로 다른 직선): false.
 * collinear (segment가 infinite-line 위에 있음): true.
 * zero-length segment는 점으로 환원해 infinite-line의 containment로 판정한다.
 *
 * @param infLine infinite-line
 * @param line 두 끝점으로 정의된 유한 선분
 * @param epsilon 평행 판정 및 거리 임계값
 */
export function intersectsInfiniteLineSegment(
  infLine: InfiniteLineLike,
  line: SegmentLike,
  epsilon = DEFAULT_EPSILON
): boolean {
  const a = readSegmentA(line);
  const b = readSegmentB(line);
  const origin = readInfiniteLineOrigin(infLine);
  const dir = readInfiniteLineDirection(infLine);

  const lineParam = segmentToLineFamilyParam(readX(a), readY(a), readX(b), readY(b));
  const infParam = infiniteLineToLineFamilyParam(readX(origin), readY(origin), readX(dir), readY(dir));

  return lineFamilyIntersects(lineParam, infParam, epsilon);
}
