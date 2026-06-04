/**
 * 무방향 line direction을 대표하는 각도를 `[0, π)` 범위로 정규화한다.
 *
 * line은 방향 부호가 없으므로 `angle`과 `angle + π`는 같은 line을 나타낸다. 이 helper는 두
 * 표현을 `[0, π)` 범위의 단일 대표 각도로 모은다. 공식: `((angle % π) + π) % π`. `π`, `-π`,
 * `2π`는 `0`으로, `-π/4`는 `3π/4`로 정규화한다. 반환값이 정확히 `π`가 되는 경우는 없다.
 *
 * `angle`은 radian. non-finite input(`NaN`, `Infinity`, `-Infinity`)은 caller 책임이며 산술 결과로
 * `NaN`을 반환한다.
 *
 * @param angle 정규화할 각도 (radian)
 */
export function principalAngle(angle: number): number {
  return ((angle % Math.PI) + Math.PI) % Math.PI;
}
