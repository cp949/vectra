import { type SideSet, solveAsaInto } from './solve-asa-into';

/**
 * 두 각도와 끼인 변으로 삼각형의 세 변 길이를 계산해 새 SideSet으로 반환한다.
 *
 * valid triangle이면 세 변 길이가 채워진 SideSet을 반환한다. invalid triangle이면 undefined를
 * 반환한다. invalid 조건은 `solveAsaInto`와 동일하다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `solveAsaInto`와 동일하다.
 * @param oppositeAngle 결과 `a` 변의 대각(radian)
 * @param sideBetween 두 입력 각도 사이의 변 길이
 * @param otherAngle 결과 `b` 변의 대각(radian)
 */
export function solveAsa(oppositeAngle: number, sideBetween: number, otherAngle: number): SideSet | undefined {
  const out: SideSet = { a: 0, b: 0, c: 0 };
  const result = solveAsaInto(out, oppositeAngle, sideBetween, otherAngle);
  return result === false ? undefined : out;
}
