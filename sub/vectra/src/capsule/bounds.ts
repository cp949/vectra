import type { BoundsWritable, CapsuleLike } from '../types';
import { boundsInto } from './bounds-into';

/**
 * capsule closed region을 포함하는 axis-aligned bounds를 새 plain object로 반환한다.
 *
 * bounds는 두 endpoint extent를 radius만큼 확장한 사각형이다. zero-axis capsule(`a === b`)도
 * center `a`와 radius `r`의 circle region AABB를 반환한다. `radius < 0`와 non-finite radius는
 * `RangeError`다. endpoint 좌표 non-finite는 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param capsule bounds로 변환할 capsule
 */
export function bounds(capsule: CapsuleLike): BoundsWritable {
  return boundsInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, capsule);
}
