/**
 * 바깥 반지름 outerRadius와 안쪽 반지름 innerRadius로 정의되는 환형(annulus) 넓이를 반환한다.
 *
 * 공식: π * (outerRadius² - innerRadius²). 두 radius를 받는 raw scalar helper이며 CircleLike를
 * 받지 않는다. `outerRadius >= innerRadius >= 0` contract를 강제한다.
 *
 * 두 radius 중 하나라도 non-finite(`NaN`, `Infinity`, `-Infinity`)이거나, `innerRadius < 0`이거나,
 * `outerRadius < innerRadius`이면 `RangeError`다. 큰 radius 곱이 overflow해 결과가 non-finite가
 * 되면 `RangeError`다. area / sectorArea와 달리 raw radius 입력을 검증하므로 empty pass-through가
 * 아니라 throw한다.
 *
 * @param outerRadius 바깥 반지름. finite, innerRadius 이상
 * @param innerRadius 안쪽 반지름. finite, 0 이상, outerRadius 이하
 */
export function circleAnnulusArea(outerRadius: number, innerRadius: number): number {
  if (!Number.isFinite(outerRadius) || !Number.isFinite(innerRadius)) {
    throw new RangeError(
      `circle annulus radii must be finite numbers, got outerRadius ${String(outerRadius)}, innerRadius ${String(innerRadius)}`
    );
  }
  if (innerRadius < 0 || outerRadius < innerRadius) {
    throw new RangeError(
      `circle annulus requires outerRadius >= innerRadius >= 0, got outerRadius ${String(outerRadius)}, innerRadius ${String(innerRadius)}`
    );
  }
  const result = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);
  if (!Number.isFinite(result)) {
    throw new RangeError(
      `circle annulus area overflowed to a non-finite value, got outerRadius ${String(outerRadius)}, innerRadius ${String(innerRadius)}`
    );
  }
  return result;
}
