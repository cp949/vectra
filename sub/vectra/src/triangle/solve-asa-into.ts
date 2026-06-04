/** 세 변 길이를 기록할 수 있는 writable output type. */
export interface SideSet {
  /** 첫 번째 각도의 대변 길이 */
  a: number;

  /** 세 번째 각도의 대변 길이 */
  b: number;

  /** 두 각도 사이의 끼인 변 길이 */
  c: number;
}

/**
 * 두 각도와 끼인 변으로 삼각형의 세 변 길이를 계산해 out에 기록한다.
 *
 * `oppositeAngle + otherAngle < Math.PI`이고 두 각도와 `sideBetween`이 모두 양수 finite number일
 * 때만 out을 수정한다. 불가능한 삼각형이면 out을 수정하지 않고 false를 반환한다.
 *
 * @param out 세 변 길이를 기록할 writable output
 * @param oppositeAngle 결과 `a` 변의 대각(radian)
 * @param sideBetween 두 입력 각도 사이의 변 길이. 결과 `c`에 그대로 기록된다.
 * @param otherAngle 결과 `b` 변의 대각(radian)
 */
export function solveAsaInto<Out extends SideSet>(
  out: Out,
  oppositeAngle: number,
  sideBetween: number,
  otherAngle: number
): Out | false {
  if (
    !Number.isFinite(oppositeAngle) ||
    oppositeAngle <= 0 ||
    !Number.isFinite(sideBetween) ||
    sideBetween <= 0 ||
    !Number.isFinite(otherAngle) ||
    otherAngle <= 0
  ) {
    return false;
  }

  const includedOppositeAngle = Math.PI - oppositeAngle - otherAngle;
  if (includedOppositeAngle <= 0) {
    return false;
  }

  const includedSine = Math.sin(includedOppositeAngle);
  if (includedSine <= 0) {
    return false;
  }

  out.a = (sideBetween * Math.sin(oppositeAngle)) / includedSine;
  out.b = (sideBetween * Math.sin(otherAngle)) / includedSine;
  out.c = sideBetween;

  return out;
}
