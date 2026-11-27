import { createZeroBounds } from '../internal/bounds';
import type { BoundsWritable, Capsule } from '../types/flat-shapes.internal';
import { boundsInto } from './bounds-into';

/**
 * capsule closed region을 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * bounds는 두 endpoint extent를 radius만큼 확장한 사각형이다. zero-axis capsule(두 끝점 좌표가 같음)도
 * 시작점 `(x1, y1)`와 radius `r`의 circle region AABB를 반환한다. `r < 0`와 non-finite radius는
 * `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule bounds로 변환할 capsule
 */
export function bounds(capsule: Capsule): BoundsWritable {
  return boundsInto(createZeroBounds(), capsule);
}
