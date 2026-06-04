import { readCapsuleA, readCapsuleB, readCapsuleRadius, validateCapsuleRadius } from '../internal/capsule';
import { readX, readY } from '../internal/xy';
import type { CapsuleLike } from '../types';
import { segmentSegmentDistanceSqXY } from './capsule-relation.internal';

/**
 * 두 capsule이 교차하거나 접하면 true를 반환한다.
 *
 * `intersects` owner가 제공하는 capsule × capsule relation이다. 두 capsule axis segment 사이
 * 최단 거리 제곱이 `(radiusA + radiusB)²` 이하이면 true다. closed boundary 포함이라
 * `최단거리 === radiusA + radiusB`이면 true다. `radius === 0` 양쪽이면 두 axis segment가
 * 교차하거나 접할 때만 true다. 한쪽 zero-axis(`a === b`)는 circle-vs-capsule, 양쪽 zero-axis는
 * circle-vs-circle 판정과 동등하다. `radius < 0`와 non-finite radius는 양쪽 모두 `RangeError`다.
 * 두 radius가 각각 finite여도 합이 `Number.MAX_VALUE` 부근에서 `Infinity`로 overflow하면
 * `(radiusA + radiusB)²`도 `Infinity`가 되어 비교가 항상 true가 된다. endpoint 좌표 non-finite는
 * 별도 검증하지 않고 산술 결과를 따른다.
 *
 * @param a 교차를 판정할 첫 capsule
 * @param b 교차를 판정할 둘째 capsule
 */
export function intersectsCapsuleCapsule(a: CapsuleLike, b: CapsuleLike): boolean {
  const ra = validateCapsuleRadius(readCapsuleRadius(a));
  const rb = validateCapsuleRadius(readCapsuleRadius(b));
  const aax = readX(readCapsuleA(a));
  const aay = readY(readCapsuleA(a));
  const abx = readX(readCapsuleB(a));
  const aby = readY(readCapsuleB(a));
  const bax = readX(readCapsuleA(b));
  const bay = readY(readCapsuleA(b));
  const bbx = readX(readCapsuleB(b));
  const bby = readY(readCapsuleB(b));
  const rSum = ra + rb;
  // squared 비교로 sqrt 호출을 피한다. closed boundary 포함
  return segmentSegmentDistanceSqXY(aax, aay, abx, aby, bax, bay, bbx, bby) <= rSum * rSum;
}
