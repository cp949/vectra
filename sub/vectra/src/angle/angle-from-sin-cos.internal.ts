/**
 * sin/cos 쌍으로부터 angle을 복원한다. `(-π, π]` 범위.
 *
 * `Math.atan2(-0, negative)`가 반환하는 `-Math.PI`를 `Math.PI`로 정규화한다.
 * `(0, 0)` 쌍은 `Math.atan2(0, 0) = 0`을 그대로 반환한다.
 * non-finite guard 없음. 호출자가 보장한다.
 */
export function rawAngleFromSinCos(sin: number, cos: number): number {
  let angle = Math.atan2(sin, cos);

  // Math.atan2(-0, negative)는 명세상 -Math.PI를 반환한다. (-π, π] 범위를 유지하기 위해 정규화한다.
  if (angle === -Math.PI) angle = Math.PI;

  return angle;
}
